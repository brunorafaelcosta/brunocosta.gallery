; "use strict";

var Gallery = Gallery || {};

(function ($) {

    Gallery.Cookies = {
        LanguageCookieName: 'brunocostagallery.language',
        LanguageCookieExpirationDays: 36525,
        CookieConsentSettingsCookieName: 'brunocostagallery.cookie_consent_status',
        CookieConsentSettingsCookieExpirationDays: 365,
        GoogleAnalyticsResetUserPrefsCookieName: 'brunocostagallery.ga_userprefs_kept'
    };

    Gallery.Utils = Gallery.Utils || {};
    Gallery.Utils.debug = function (message) {
        console.debug(message);
    };
    Gallery.Utils.triggerEvent = function (eventName, eventData) {
        var event = jQuery.Event(eventName);
        eventData = eventData || {};
        $(document).trigger(event, eventData);
        return event;
    };
    Gallery.Utils.getCookie = function (cookieName) {
        var name = cookieName + "=";
        var ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };
    Gallery.Utils.setCookie = function (cookieName, cookieValue, expirationDays) {
        var expires = "";
        var date = new Date();
        date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
        document.cookie = cookieName + "=" + cookieValue + expires + "; path=/";
    };
    Gallery.Utils.showPopup = function (url, title, w, h) {
        const dualScreenLeft = window.screenLeft !==  undefined ? window.screenLeft : window.screenX;
        const dualScreenTop = window.screenTop !==  undefined   ? window.screenTop  : window.screenY;
        const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
        const systemZoom = width / window.screen.availWidth;
        const left = (width - w) / 2 / systemZoom + dualScreenLeft
        const top = (height - h) / 2 / systemZoom + dualScreenTop
        const newWindow = window.open(url, title, 
            'directories=no, titlebar=no, toolbar=no, location=no, status=no, menubar=no'
            + ', scrollbars=yes,resizable=yes'
            + ', width=' + (w / systemZoom)
            + ', height=' + (h / systemZoom)
            + ', top=' + (top)
            + ', left=' + (left)
        );
    
        if (window.focus) newWindow.focus();
    };

    Gallery.App = function (options) {
        var _self = this;
        var _cookieConsent = null;

        var _defaults = {
            emailSenderEndpoint: '',
            emailSenderKey: '',

            currentPageId: null,

            language: null,
            
            cookieConsentSettings: {
                show: true,
                consentModalDescription: 'consentModalDescription',
                consentModalAcceptAll: 'consentModalAcceptAll',
                settingsModalTitle: 'settingsModalTitle',
                settingsModalSubtitle: 'settingsModalSubtitle',
                settingsModalDescription: 'settingsModalDescription',
                settingsModalMoreInformationTitle: 'settingsModalMoreInformationTitle',
                settingsModalMoreInformationDescription: 'settingsModalMoreInformationDescription',
                settingsModalClose: 'settingsModalClose',
                settingsModalSave: 'settingsModalSave',
                settingsModalAcceptAll: 'settingsModalAcceptAll',
                settingsModalRejectAll: 'settingsModalRejectAll',
                settingsModalStrictlyNecessaryTitle: 'settingsModalStrictlyNecessaryTitle',
                settingsModalStrictlyNecessaryDescription: 'settingsModalStrictlyNecessaryDescription',
                settingsModalPerformanceAndAnalyticsTitle: 'settingsModalPerformanceAndAnalyticsTitle',
                settingsModalPerformanceAndAnalyticsDescription: 'settingsModalPerformanceAndAnalyticsDescription'
            }
        };

        // Override defaults if needed
        var _options = $.extend(true, {}, _defaults, options);

        // jQuery objects
        var $document = $(document);

        // ========================================================================================
        // Helpers
        // ========================================================================================
        var _initCookieConsents = function () {
            Gallery.Utils.debug("Cookie Consents - Initializing...");

            _cookieConsent = initCookieConsent();
    
            _cookieConsent.run({
                autorun: _options.cookieConsentSettings.show,
                gui_options: {
                    consent_modal: {
                        layout: 'cloud',
                        position: 'bottom center',
                        transition: 'slide',
                        swap_buttons: false
                    },
                    settings_modal: {
                        layout: 'box',
                        transition: 'slide'
                    }
                },
                current_lang: "default",
                autoclear_cookies: false,
                page_scripts: true,
                force_consent: true,
                revision: 0,
                cookie_name: Gallery.Cookies.CookieConsentSettingsCookieName,
                cookie_expiration: Gallery.Cookies.CookieConsentSettingsCookieExpirationDays,
                
                onFirstAction: function(user_preferences, cookie) {
                    // callback triggered only once on the first accept/reject action
                    cookie["level"] = cookie["level"] || [];
                    
                    var analyticsAccepted = cookie["level"].includes("analytics");
                },
    
                onAccept: function (cookie) {
                    // callback triggered on the first accept/reject action, and after each page load
                    cookie["level"] = cookie["level"] || [];
                    
                    var analyticsAccepted = cookie["level"].includes("analytics");
                },
    
                onChange: function (cookie, changed_categories) {
                    // callback triggered when user changes preferences after consent has already been given
                    cookie["level"] = cookie["level"] || [];
                    changed_categories = changed_categories || [];
                    
                    var analyticsAccepted = cookie["level"].includes("analytics");
                    var analyticsChanged = changed_categories.includes("analytics");
                },
    
                languages: {
                    "default": {
                        consent_modal: {
                            description: _options.cookieConsentSettings.consentModalDescription,
                            primary_btn: {
                                text: _options.cookieConsentSettings.consentModalAcceptAll,
                                role: "accept_all"
                            },
                            secondary_btn: {
                                text: _options.cookieConsentSettings.settingsModalTitle,
                                role: "settings"
                            }
                        },
                        settings_modal: {
                            title: _options.cookieConsentSettings.settingsModalTitle,
                            save_settings_btn: _options.cookieConsentSettings.settingsModalSave,
                            accept_all_btn: _options.cookieConsentSettings.settingsModalAcceptAll,
                            //- reject_all_btn: _options.cookieConsentSettings.settingsModalRejectAll,
                            close_btn_label: _options.cookieConsentSettings.settingsModalClose,
                            blocks: [
                                {
                                    title: _options.cookieConsentSettings.settingsModalSubtitle,
                                    description: _options.cookieConsentSettings.settingsModalDescription,
                                }, {
                                    title: _options.cookieConsentSettings.settingsModalStrictlyNecessaryTitle,
                                    description: _options.cookieConsentSettings.settingsModalStrictlyNecessaryDescription,
                                    toggle: {
                                        value: "necessary",
                                        enabled: true,
                                        readonly: true
                                    }
                                }, {
                                    title: _options.cookieConsentSettings.settingsModalPerformanceAndAnalyticsTitle,
                                    description: _options.cookieConsentSettings.settingsModalPerformanceAndAnalyticsDescription,
                                    toggle: {
                                        value: "analytics",
                                        enabled: true,
                                        readonly: false
                                    }
                                }, {
                                    title: _options.cookieConsentSettings.settingsModalMoreInformationTitle,
                                    description: _options.cookieConsentSettings.settingsModalMoreInformationDescription
                                }
                            ]
                        }
                    }
                }
            });
    
            Gallery.Utils.debug("Cookie Consents - Initialized");
        };

        var _initMenu = function () {
            var cm = $(".nav-button"),
                nh = $(".nav-inner"),
                no = $(".nav-overlay"),
                hidmen = $('#hid-men');

            hidmen.css({
                'position' : 'absolute',
                'top' : '50%',
                'margin-top' : -hidmen.height()/2
            });
            hidmen.menu();
            function showmenu() {
                setTimeout(function() {
                    nh.addClass("vismen");
                }, 120);
                cm.addClass("cmenu");
                nh.removeClass("isDown");
                no.addClass("visover");
            }
            function hidemenu() {
                nh.addClass("isDown");
                cm.removeClass("cmenu");
                nh.removeClass("vismen");
                no.removeClass("visover");
            }
            cm.on("click", function() {
                if (nh.hasClass("isDown")) {
                    showmenu();
                }
                else {
                hidemenu();
        
                }
                return false;
            });
            no.on("click", function() {
                hidemenu();
                return false;
            });
            cm.attr("onclick","return true");
        };

        var _initAnimations = function () {
            document.addEventListener('gesturestart', function (e) {
                e.preventDefault();
            });

            $(".loader").fadeOut(500, function() {
                $("#main").animate({
                    opacity: "1"
                }, 500);
                setTimeout(function() {
                    $(".content-holder").removeClass("scale-bg2");
                }, 450);
            });

            $(".bg").each(function(a) {
                if ($(this).attr("data-bg")) $(this).css("background-image", "url(" + $(this).data("bg") + ")");
            });

            $(".alt").each(function() {
                $(this).css({
                    "margin-top": -1 * $(this).outerHeight()/2
                });
            });

            var headanim = $("header"), footanim = $("footer"), conhold = $(".content-holder");
            function hideheader() {
                headanim.animate({
                    top: "-65px"
                }, 200);
            }
            function showheader() {
                headanim.animate({
                    top: "0"
                }, 200);
            }
            function hidefooter() {
                footanim.animate({
                    bottom: "-55px"
                }, 500);
            }
            function showfooter() {
                footanim.animate({
                    bottom: "0"
                }, 500);
            }
            if (conhold.hasClass("nopad")) hidefooter(); else showfooter();
            if (conhold.hasClass("fl-con-wrap")) hideheader(); else showheader();
            if (conhold.hasClass("no-vis-footer")) hidefooter();
            var $window = $(window);
            $window.on('resize', function(){
                if ($(".resize-carousel-holder").hasClass("res-protoc")) if ($(window).width() > 756) location.reload();
            });
            $window.on("scroll", function(a) {
                if ($(this).scrollTop() > 150) {
                    $(".to-top").fadeIn(500);
                } else {
                    $(".to-top").fadeOut(500);
                }
            });
            $('<a class="to-top"><i class="fa fa-long-arrow-up"></i></a>').appendTo(".column-wrap");
            $(".to-top").on("click", function(a) {
                a.preventDefault();
                $("html, body").animate({
                    scrollTop: 0
                }, 800);
                return false;
            });
        };

        var _initExplore = function () {
            function isotope() {
                if ($(".gallery-items").length) {
                    var a = $(".gallery-items").isotope({
                        singleMode: true,
                        columnWidth: ".grid-sizer, .grid-sizer-second, .grid-sizer-three",
                        itemSelector: ".gallery-item, .gallery-item-second, .gallery-item-three",
                        transformsEnabled: true,
                        transitionDuration: "700ms",
                        resizable: true,
                        getSortData: {
                            number: '[data-position] parseInt'
                        },
                        sortBy: "number",
                        sortAscending: false,
                        layoutMode: 'fitRows'
                    });
                    a.imagesLoaded(function() {
                        a.isotope("layout");
                    });
                    $(".gallery-filters").on("click", "a.gallery-filter", function(b) {
                        b.preventDefault();
                        var c = $(this).attr("data-filter");
                        var layout = 'fitRows';
                        if (c !== '*')
                            layout = 'packery';
                        a.isotope({
                            filter: c,
                            layoutMode: layout
                        });
                        $(".gallery-filters a.gallery-filter").removeClass("gallery-filter-active");
                        $(this).addClass("gallery-filter-active");
                        return false;
                    });
        
                }
                var curColor = $(".p_horizontal_wrap").data("csc");
                var c = {
                    touchbehavior: true,
                    cursoropacitymax: 1,
                    cursorborderradius: "6px",
                    background: "transparent",
                    cursorwidth: "5px",
                    cursorborder: "0px",
                    cursorcolor: curColor,
                    autohidemode:false,
                    bouncescroll: true,
                    scrollspeed: 120,
                    mousescrollstep: 90,
                    grabcursorenabled: false,
                    horizrailenabled: true,
                    preservenativescrolling: true,
                    cursordragontouch: true,
                    railpadding: {
                        top: 33,
                        right: 0,
                        left:  0,
                        bottom: 0
                    }
                };
                $(".p_horizontal_wrap").niceScroll(c);
                var d = $("#portfolio_horizontal_container");
                d.imagesLoaded(function(a, b, e) {
                    var f = {
                        itemSelector: ".portfolio_item",
                        layoutMode: "packery",
                        packery: {
                            isHorizontal: true,
                            gutter: 0
                        },
                        resizable: true,
                        transformsEnabled: true,
                        transitionDuration: "1000ms",
                    };
                    var g = {
                        itemSelector: ".portfolio_item",
                        layoutMode: "packery",
                        packery: {
                            isHorizontal: false,
                            gutter: 0
                        },
                        resizable: true,
                        transformsEnabled: true,
                        transitionDuration: "700ms"
                    };
                    if ($(window).width() < 756) {
                        d.isotope(g);
                        d.isotope("layout");
                        if ($(".p_horizontal_wrap").getNiceScroll()) $(".p_horizontal_wrap").getNiceScroll().remove();
        
                    } else {
                        d.isotope(f);
                        d.isotope("layout");
                        $(".p_horizontal_wrap").niceScroll(c);
                    }
                    $(".gallery-filters").on("click", "a", function(a) {
                        a.preventDefault();
                        var b = $(this).attr("data-filter");
                        $('.p_horizontal_wrap').animate({scrollLeft: 2}, 500);
                        setTimeout(function () {
                            d.isotope({
                                filter: b
                            });
                        }, 900);
                        $(".gallery-filters a").removeClass("gallery-filter-active");
                        $(this).addClass("gallery-filter-active");
                    });
        
                });
            }
            isotope();
        };

        var _initLightGallery = function () {
            $(".single-popup-image").lightGallery({
                selector: "this",
                cssEasing: "cubic-bezier(0.25, 0, 0.25, 1)",
                download: false,
                counter: false
            });
        };

        var _initShare = function () {
            $(".share-container").share({
                networks: ['facebook','twitter','linkedin','pinterest']
            });
        };

        // ========================================================================================
        // Events
        // ========================================================================================
        var initializedEventName = 'brunocostagallery.initialized';

        // ========================================================================================
        // Prototype
        // ========================================================================================
        this.init = function () {
            Gallery.Utils.debug("Initializing...");

            _initCookieConsents.call(_self);

            _initMenu.call(_self);

            _initAnimations.call(_self);

            _initLightGallery.call(_self);

            _initExplore.call(_self);
            
            $(document).on({
                ksctbCallback: function() {
                    _initExplore.call(_self);
                }
            });

            _initShare.call(_self);

            Gallery.Utils.triggerEvent(initializedEventName);

            Gallery.Utils.debug("Initialized");
        };

        this.setLanguage = function (language, currentSlug) {
            Gallery.Utils.setCookie(Gallery.Cookies.LanguageCookieName, language, Gallery.Cookies.LanguageCookieExpirationDays);
            window.location = currentSlug;
        };

        this.getLanguage = function () {
            return Gallery.Utils.getCookie(Gallery.Cookies.LanguageCookieName);
        };

        this.showCookiePolicyPopup = function (slug, title) {
            Gallery.Utils.showPopup(slug, title, 720, 480);
        };

        this.shouldResetGoogleAnalyticsUserPrefs = function () {
            return Gallery.Utils.getCookie(Gallery.Cookies.GoogleAnalyticsResetUserPrefsCookieName) !== "true";
        };

        this.sendEmail = function (from, subject, body) {
            $.ajax({
                type: 'POST',
                url: _options.emailSenderEndpoint,
                data: {
                  key: _options.emailSenderKey,
                  message: {
                    from: from,
                    subject: subject,
                    body: body
                  }
                }
               }).done(function(response) {
                 console.log(response);
               });
        };
    };

})(jQuery);