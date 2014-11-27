// Interfaces with the Google Play Music tab

$(function() {
  var popupID = -1;
  var socket = io('https://miniplay.herokuapp.com');
  var port = chrome.runtime.connect({name: "interface"});
  var popup_port = null;
  var old_status = null;

  function update(slider, vslider) {
    old_status = JSON.parse(JSON.stringify(music_status));
    music_status.update();
    music_status.slider_updated = (slider == true);
    music_status.vslider_updated = (vslider == true);
    socket.emit('data', music_status);
    var msg = create_background_msg(old_status, music_status);
    if (msg != null) {
      port.postMessage(msg);
    }
    if (popup_port) {
      popup_port.postMessage(music_status);
    }
  }

  function create_background_msg(oldValue, newValue) {
    var msg = {scrobble: false, notify: false};
    msg.oldValue = oldValue;
    msg.newValue = newValue;
    if (oldValue === undefined || oldValue.title != newValue.title ||
        oldValue.artist != newValue.artist || oldValue.album_art != newValue.album_art) {
      msg.scrobble = true;
      if (newValue.title != '') {
        msg.notify = true;
      }

      return msg;
    }
    else {
      return null;
    }
  }

  function update_slider(position, slidername) {  //position is in %
    var slider = document.getElementById(slidername);
    var newWidth = Math.round(position * slider.offsetWidth);
    var rect = slider.getBoundingClientRect();

    slider.dispatchEvent(new MouseEvent('click', {
      clientX: newWidth + rect.left + slider.clientLeft - slider.scrollLeft,
      clientY: rect.top + slider.clientTop - slider.scrollTop
    }));
  }

  function send_command(message) {
    var $button = null;
    switch (message.type) {
      case 'play':
        $button = $('button[data-id="play-pause"]');
        if ($button.attr('disabled')) {
          $button = $('[data-type="imfl"]');  // I'm feeling lucky radio
        }
        break;
      case 'rew':
        $button = $('button[data-id="rewind"]'); break;
      case 'ff':
        $button = $('button[data-id="forward"]'); break;
      case 'up':
        $button = $('li[title="Thumbs up"]'); break;
      case 'down':
        $button = $('li[title="Thumbs down"]'); break;
      case 'shuffle':
        $button = $('button[data-id="shuffle"]'); break;
      case 'repeat':
        $button = $('button[data-id="repeat"]'); break;
      case 'slider':
        update_slider(message.position, 'slider'); break;
      case 'vslider':
        update_slider(message.position, 'vslider'); break;
    }
    if ($button !== null) {
      $button.click();
    }
    window.setTimeout( function() {
      update(message.type == 'slider', message.type == 'vslider');
    }, 30);
  }

  socket.on('connect', function() {
    // TODO: find a better selector (user and authuser might not be 0)
    var email = $('a[href="/music/listen?u=0&authuser=0"] > div:contains("(default)") > div:contains("(default)")').text().split(' ')[0];
    socket.emit('room', {client : 'player', room : email});
  });

  socket.on('data', function(message) {
    if (message.action === 'update_status') {
      update();
    }
    if (message.action === 'send_command') {
      send_command(message);
    }
  });

  chrome.runtime.onConnect.addListener(function(port) {
    if (port.name == 'popup') {
      popup_port = port;
      port.onDisconnect.addListener(function() {
        popup_port = null;
      });
      port.onMessage.addListener(function(msg) {
        if (msg.action === 'update_status') {
          update();
        }
        if (msg.action === 'send_command') {
          send_command(msg);
        }
      });
    }
  });

  port.onMessage.addListener(function(msg) {
    if (msg.type == 'connect') {
      popupID = msg.id;
    }
    else if (msg.type == 'disconnect') {
      popupID = -1;
    }
  });

  window.setInterval(update, 1000);
});
