(function($) {

  var initialized = !1;
  var sliders = [];
  var active = null;

  function newID() {
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return randLetter + Date.now();
  }

  $.fn.slimSlider = function(options) {

    // Default settings
    var settings = $.extend({
      items: [],
      frequency: 0,
      intermediate: !0,
      init_sections: 0,
      snap: !0,
      label: '',
      sections: true,
      bar: false,
      bubble: true,
      decimal_places: 2
    }, options);

    return this.each(function() {
      var $sliderContainer = $(this);

      var $label = settings.label != '' ? $(settings.label) : null;

      // create slider
      var sliderID = newID();
      var $slider = $('<div/>').addClass('slider').attr('data-id', sliderID);

      // slider bubble
      var $bubble = $('<div/>').addClass('bubble');
      var $bubbleContent = $('<div/>');
      $bubbleContent.appendTo($bubble);
      $slider.append($bubble);

      // slider progress bar
      var $sliderProgress = $('<div/>').addClass('progress');
      var $sliderProgressBar = $('<div/>').addClass('progress-bar');
      var $sliderProgressBarContainer = $('<div/>').addClass('progress-bar--container');
      var $sliderProgressBarActive = $('<div/>').addClass('progress-bar-active');
      var $sliderProgressBarSecondary = $('<div/>').addClass('progress-bar-secondary');
      // $sliderProgressBarSecondary.appendTo($sliderProgressBarContainer);
      $sliderProgressBarActive.appendTo($sliderProgressBarContainer);
      $sliderProgressBarContainer.appendTo($sliderProgressBar);
      $sliderProgressBar.appendTo($sliderProgress);

      // slider progress sections
      var $sliderProgressSections = $('<div/>').addClass('progress-sections');
      $sliderProgressSections.appendTo($sliderProgress);

      $slider.append($sliderProgress);

      // slider knob
      var $sliderKnob = $('<div/>').addClass('slider-knob');
      $('<div/>').addClass('slider-knob--inner').appendTo($sliderKnob);
      $slider.append($sliderKnob);

      $sliderContainer.append($slider);

      sliders[sliderID] = {
        'label': $label,
        'min': 0,
        'max': 0,
        'active_section': 0,
        'settings': settings,
        'slider': $slider,
        'bar': $sliderProgressBarActive,
        'knob': $sliderKnob,
        'bubble': $bubble,
        'bubbleContent': $bubbleContent
      };

      if(settings.sections) {
        if(settings.items.length) {
              var sections = settings.items.length;
            for (var section = 0; section < sections; section++) {
              var newpos = ((section / (sections-1)) * 100);
              var $section = $('<div/>').addClass('progress-section').css({
                'left': newpos + '%'
              }).attr('data-id', section);

              var $sectionText = $('<div/>').addClass('progress-section--text').html(settings.items[section]);
              $sectionText.appendTo($section)

              var do_append = true;
              if (section == 0 || section == (sections-1) || section % settings.frequency == 0) {
                  $section.addClass('progress-section--major');
              }
              else {
                  if(!settings.intermediate) {
                      do_append = false;
                  }
              }

              if(do_append) {
                  $section.appendTo($sliderProgressSections);
              }
            }
        }
        else {
            for (var newpos = 0; newpos <= 100; newpos+=settings.frequency) {
              var $section = $('<div/>').addClass('progress-section').css({
                'left': newpos + '%'
              });

              $section.addClass('progress-section--major');
              $section.appendTo($sliderProgressSections);
            }
        }
      }

      $slider.on('mouseover', function(e) {
        $(this).addClass('expand');
      });
      $slider.on('mouseout', function(e) {
        if (active) return;
        $(this).removeClass('expand');
        active = null;
      });

      $slider.on('mousedown', function(e) {
        if (active) return;
        active = $(this).data('id');
        var slider = sliders[active];
        
        var newleft = e.pageX - slider.slider.offset().left;

        slider.knob.animate({
          'left':newleft + 'px'
        }, 10, function() {
          set_new_section(slider);
        });
      });
      $sliderKnob.on('mousedown', function(e) {
        if (active) return;
        active = $(this).parents('.slider').data('id');
        var slider = sliders[active];

        slider.knob.addClass('active');
        slider.slider.addClass('expand');

        set_new_section(slider);
      });

      $slider.on('touchend', function(e) {
        if (active) return;
        $(this).removeClass('expand');
        active = null;
      });
      $slider.on('touchstart', function(ev) {
        if (active) return;
        active = $(this).data('id');
        var slider = sliders[active];

        $(this).addClass('expand');
        var e = ev.originalEvent;
        var touch = e.touches[0];

        var newleft = touch.pageX - slider.slider.offset().left;

        slider.knob.animate({
          'left': newleft + 'px'
        }, 10, function() {
          set_new_section(slider);
        });
      });

      if (!initialized) {
        initialized = !0;

        $(document).on('mouseup', function(e) {
          if (!active) return;
          var slider = sliders[active];

          set_new_section(slider, !0);

          slider.knob.removeClass('active');
          slider.slider.removeClass('expand');

          active = null;
        });
        $(document).on('mousemove', function(ev) {
          if (!active) return;
          var slider = sliders[active];
          var e = ev.originalEvent;

          var min_left = 0;
          var max_left = slider.slider.width() - slider.knob.width();

          var pos = slider.knob.position();
          var left = pos.left;
          
          var newleft = e.pageX - slider.slider.offset().left;
          //var movement = e.movementX;
          //var newleft = left + movement;
          newleft = newleft < min_left ? min_left : newleft > max_left ? max_left : newleft;
          slider.knob.css({
            'left': newleft + 'px'
          });

          set_new_section(slider);
        });

        $(document).on('touchend', function(e) {
          if (!active) return;
          var slider = sliders[active];

          set_new_section(slider, !0);

          slider.knob.removeClass('active');
          slider.slider.removeClass('expand');

          active = null;
        });
        $(document).on('touchmove', function(ev) {
          if (!active) return;
          var slider = sliders[active];

          var e = ev.originalEvent;
          var touch = e.touches[0];

          var min_left = 0;
          var max_left = slider.slider.width() - slider.knob.width();

          var pos = slider.knob.position();
          var newleft = touch.pageX - slider.slider.offset().left;
          newleft = newleft < min_left ? min_left : newleft > max_left ? max_left : newleft;
          slider.knob.css({
            'left': newleft + 'px'
          });

          set_new_section(slider);
        });
      }

      // activate knob
      function activate(n, i) {
        var slider = sliders[i];

        slider.knob.css({
          'display': 'block'
        });
        slider['active_section'] = n;
        set_section(slider, n);
        
        $('.progress-section[data-id="'+n+'"]', slider.slider).addClass('active');

        slider.knob.css({
          'opacity': 1
        });
      }

      function set_new_section(slider, snap) {
        snap = snap || !1;
        snap = snap && slider.settings.snap;

        var min_left = 0;
        var max_left = $slider.width() - slider.knob.width();

        var pos = slider.knob.position();

        var newn = (pos.left / max_left);
        newn = newn > 1 ? 1 : newn;

        if(slider.settings.items.length) {
            newn = newn * (slider.settings.items.length - 1);
            var newn_up = newn + 0.5;
            newn = parseInt(newn);
            newn_up = parseInt(newn_up);
            if (newn != newn_up) {
              newn = newn_up;
            }

            if(slider.settings.bar) {
              slider.bar.css({'width': pos.left + 'px'});
            }

            if (snap) {
              set_section(slider, newn);
            } else {
              position_bubble(slider, pos.left);
              if (newn != slider['active_section']) {
                slider['active_section'] = newn;
                set_bubble_text(slider, slider.settings.items[newn]);
                
                $('.progress-section.active', slider.slider).removeClass('active');
                $('.progress-section[data-id="'+newn+'"]', slider.slider).addClass('active');
              }
            }
        } else {
            newn = (newn * (slider.settings.max - slider.settings.min)) + slider.settings.min;
            position_bubble(slider, pos.left);
            set_bubble_text(slider, newn.toFixed(slider.settings.decimal_places));
        }
      }

      function set_section(slider, n) {
        var min_left = 0;
        var max_left = slider.slider.width() - slider.knob.width();

        var newpos = n / (slider.settings.items.length - 1);
        var section_pos = newpos * max_left;
        slider.knob.css({
          'left': section_pos + 'px'
        });

        set_bubble(slider, n);

        if(slider.settings.bar) {
          slider.bar.css({'width': section_pos + 'px'});
        }
      }

      function position_bubble(slider, left) {
        var bubble_pos = left - (slider.bubble.width() - 22) / 2;
        slider.bubble.css({
          'left': bubble_pos + 'px'
        });
      }

      function set_bubble_text(slider, text) {
        slider.bubbleContent.html(text);
        slider.label.html(text);
      }

      function set_bubble(slider, n) {
        var min_left = 0;
        var max_left = slider.slider.width() - slider.knob.width();

        var newpos = n / (slider.settings.items.length - 1);
        position_bubble(slider, newpos * max_left);

        set_bubble_text(slider, slider.settings.items[n]);
      }

      activate(sliders[sliderID].settings.init_sections, sliderID);

    });
  }

}(jQuery));

var items = ['mammals', 'birds', 'fishes', 'reptiles', 'amphibians', 'invertebrates'];
$('.container').slimSlider({
    'label': '.container-label',
    'items': items,
    'sections': true,
    'bar': true,
    'snap': !0
});

$('.numbers').slimSlider({
    'label': '.numbers-label',
    'items': [1, 2, 3, 4, 5, 6, 7],
    'snap': !1
});

$('.decimals').slimSlider({
    'label': '.decimals-label',
    'min': 1,
    'max': 25,
    'frequency': 20,
    'intermediate': !1,
    'snap': !1
});