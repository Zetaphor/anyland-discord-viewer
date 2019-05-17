$(document).ready(function () {
    var socket = io();
    var currentTab = '';

    var channels = {};
    var defaultChannels = {
      'bot-test': false,
      'welcome': false,
      'updates': false,
      'twitter': false,
      'announcements': false,
      'general': true,
      'off-topic': true,
      'discussions': true,
      'anyland-memes': false,
      'memes': true,
      'tele-text': false,
      'your-content-and-art': false,
      'project-showcase': false,
      'music': false,
      'botchannel': false,
      'help-resources': false,
      'general-help': false,
      'scripting-help': false,
      'existentiality': false,
      'vr': false,
      'reality': false,
      'philosophy': false,
      'anyland': false,
      'game-servers': false,
      'games-general': false,
      'bugs-n-suggestions': false,
      'praise-philipp': false,
      'trading': false,
      'sleep': false,
      'cornbread': false
    };

    var settings = getCookie('discordsettings');
    if (!settings.length) channels = defaultChannels;
    else {
      settings = JSON.parse(settings);
      channels = settings.channels;
      $('.bgColor').val(settings.bgColor);
      $('.fgColor').val(settings.fgColor);
      $('body').css("background-color", '#' + settings.bgColor);
      $('body').css("color", '#' + settings.fgColor);
    }

    let channelList = Object.keys(channels);
    for (let index = 0; index < channelList.length; index++) {
      const channel = channelList[index];
      let styleString = ''
      if (!channels[channel]) styleString = 'display:none;';
      $('.tabs').append('<button style="' + styleString + '" class="tablinks tab-' + channel + '" onclick="openTab(event, \'' + channel + '\')">' + channel + ' <span class="unread">(<span class="unreadValue">0</span>)</span></button>');
      $('.tabscontents').append('<div id="' + channel + '" class="tabcontent"></div>');
      $('.channel-list ul').append('<li class="list-check"><label><input data-id="' + channel + '" class="channel-check" type="checkbox" ' + (channels[channel] ? 'checked' : '') + ' >' + channel + '</label></li>');
    }

    $('.channel-list ul').on('click', '.channel-check', function (e) {
      let elId = $(e.target).attr('data-id')
      channels[elId] = !channels[elId];
      if (channels[elId]) $('.tab-' + elId).show();
      else $('.tab-' + elId).hide();
      updateCookie();
    });

    window.updateFg = function (e) {
      $('body').css("color", '#' + $('.fgColor').val());
      updateCookie();
    }

    window.updateBg = function (e) {
      $('body').css("background-color", '#' + $('.bgColor').val());
      updateCookie();
    }

    function updateCookie() {
      setCookie('discordsettings', JSON.stringify({
        channels: channels,
        bgColor: $('.bgColor').val(),
        fgColor: $('.fgColor').val(),
      }));
    }

    socket.emit('getChannels', channelList);

    socket.on('new message', function (data) {
      if (data.userImage === null) data.userImage = 'https://discordapp.com/assets/e05ead6e6ebc08df9291738d0aa6986d.png'
      $('#' + data.channel).append('<div class="message"><span class="timestamp">' + moment(data.created).format('L LT') + '</span><img class="avatar" src="' + data.userImage + '" />' + data.username + ': ' + data.message + '</div>');
      if (data.channel == currentTab) $("html, body").scrollTop($('body').height());
      else {
        let currentCount = Number($('.tab-' + data.channel + ' .unreadValue').html())
        currentCount++;
        $('.tab-' + data.channel + ' .unreadValue').html(currentCount);
        $('.tab-' + data.channel + ' .unread').show();
      }
    });

    window.openTab = function (evt, tabName) {
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      document.getElementById(tabName).style.display = "block";
      evt.currentTarget.className += " active";
      currentTab = tabName;
      $('.tab-' + tabName + ' .unreadValue').html('0');
      $('.tab-' + tabName + ' .unread').hide();
      $("html, body").scrollTop($('body').height());
    }

    function setCookie(cname, cvalue) {
      var d = new Date();
      d.setTime(d.getTime() + (730 * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }
  });