$(function() {
  $('#extension').click(function() {
    chrome.tabs.create({url: "chrome://chrome/extensions"});
  });

  chrome.storage.sync.get(['enable-shortcuts', 'enable-notifications'],
    function (data) {
      if (data['enable-notifications'] === undefined ||
          data['enable-notifications'] == true) {
        $('#enable-notifications').prop('checked', true);
        chrome.storage.sync.set({'enable-notifications' : true});
      }
      if (data['enable-shortcuts'] === undefined ||
          data['enable-shortcuts'] == true) {
        $('#enable-shortcuts').prop('checked', true);
        chrome.storage.sync.set({'enable-shortcuts' : true});
      }
    });

  $('#enable-shortcuts').click(function() {
    chrome.storage.sync.set(
      {'enable-shortcuts' : $('#enable-shortcuts').is(':checked')});
  });

  $('#enable-notifications').click(function() {
    chrome.storage.sync.set(
      {'enable-notifications' : $('#enable-notifications').is(':checked')});
  });

  $('.menu a').click(function(ev) {
    ev.preventDefault();
    var selected = 'selected';

    $('.mainview > *').removeClass(selected);
    $('.menu li').removeClass(selected);
    setTimeout(function() {
      $('.mainview > *:not(.selected)').css('display', 'none');
    }, 100);

    $(ev.currentTarget).parent().addClass(selected);
    var currentView = $($(ev.currentTarget).attr('href'));
    currentView.css('display', 'block');
    setTimeout(function() {
      currentView.addClass(selected);
    }, 0);

    setTimeout(function() {
      $('body')[0].scrollTop = 0;
    }, 200);
  });

  $('#launch_modal').click(function(ev) {
    ev.preventDefault();
    var modal = $('.overlay').clone();
    $(modal).removeAttr('style');
    $(modal).find('button, .close-button').click(function() {
      $(modal).addClass('transparent');
      setTimeout(function() {
        $(modal).remove();
      }, 1000);
    });

    $(modal).click(function() {
      $(modal).find('.page').addClass('pulse');
      $(modal).find('.page').on('webkitAnimationEnd', function() {
        $(this).removeClass('pulse');
      });
    });
    $(modal).find('.page').click(function(ev) {
      ev.stopPropagation();
    });
    $('body').append(modal);
  });

  $('.mainview > *:not(.selected)').css('display', 'none');
});