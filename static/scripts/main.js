; "use strict";

let Gallery = (function () {
    
    let language = null;
    let cookieConsent = null;
    let cookieConsentSettings = null;
    let onGoogleAnalyticsCanBeEnabled = null;
    let onGoogleAnalyticsConsentGiven = null;
    
    var _googleAnalyticsResetUserPrefs = true;
    var _googleAnalyticsResetUserPrefsCookieName = 'brunocostagallery.ga_userprefs_kept';

    // Constructor
    function Gallery() {
    }

    function _initGoogleAnalytics() {
        _debug("Google Analytics - Initializing...");

        if (_getCookie(_googleAnalyticsResetUserPrefsCookieName) === "true") {
            _googleAnalyticsResetUserPrefs = false;
            _debug("Google Analytics - Keep UserPrefs!");
        }

        if (this.cookieConsentSettings && !this.cookieConsentSettings.enabled) {
            _googleAnalyticsConsentGiven.call(this, true);
            _googleAnalyticsCanBeEnabled.call(this);
        }
        
        _debug("Google Analytics - Initialized!");
    }
    function _googleAnalyticsCanBeEnabled() {
        if (this.onGoogleAnalyticsCanBeEnabled && typeof this.onGoogleAnalyticsCanBeEnabled === "function") {
            this.onGoogleAnalyticsCanBeEnabled(_googleAnalyticsResetUserPrefs);
            _debug("Google Analytics - Enabled!");
        }
    }
    function _googleAnalyticsConsentGiven(accepted) {
        if (this.onGoogleAnalyticsConsentGiven && typeof this.onGoogleAnalyticsConsentGiven === "function") {
            this.onGoogleAnalyticsConsentGiven(accepted);

            if (accepted)
                _debug("Google Analytics - Consent allowed!");
            else
                _debug("Google Analytics - Consent denied!");
        }
    }

    function _initCookieConsents() {
        let self = this;

        _debug("Cookie Consents - Initializing...");
        _debug("Cookie Consents - Enabled: " + this.cookieConsentSettings.enabled);

        this.cookieConsent = initCookieConsent();

        this.cookieConsent.run({
            autorun: this.cookieConsentSettings.enabled,
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
            autoclear_cookies: true,
            page_scripts: true,
            force_consent: true,
            revision: 0,
            cookie_name: this.cookieConsentSettings.cookieName,
            cookie_expiration: this.cookieConsentSettings.cookieExpiration,
            
            onFirstAction: function(user_preferences, cookie) {
                // callback triggered only once on the first accept/reject action
                cookie["level"] = cookie["level"] || [];
                
                let analyticsAccepted = cookie["level"].includes("analytics");
                _googleAnalyticsConsentGiven.call(self, analyticsAccepted);
            },

            onAccept: function (cookie) {
                // callback triggered on the first accept/reject action, and after each page load
                cookie["level"] = cookie["level"] || [];
                
                let analyticsAccepted = cookie["level"].includes("analytics");
                if (analyticsAccepted)
                    _googleAnalyticsCanBeEnabled.call(self);
            },

            onChange: function (cookie, changed_categories) {
                // callback triggered when user changes preferences after consent has already been given
                cookie["level"] = cookie["level"] || [];
                changed_categories = changed_categories || [];
                
                let analyticsAccepted = cookie["level"].includes("analytics");
                let analyticsChanged = changed_categories.includes("analytics");
                if (analyticsChanged)
                    _googleAnalyticsConsentGiven.call(self, analyticsAccepted);
            },

            languages: {
                "default": {
                    consent_modal: {
                        description: this.cookieConsentSettings.consentModalDescription,
                        primary_btn: {
                            text: this.cookieConsentSettings.consentModalAcceptAll,
                            role: "accept_all"
                        },
                        secondary_btn: {
                            text: this.cookieConsentSettings.settingsModalTitle,
                            role: "settings"
                        }
                    },
                    settings_modal: {
                        title: this.cookieConsentSettings.settingsModalTitle,
                        save_settings_btn: this.cookieConsentSettings.settingsModalSave,
                        accept_all_btn: this.cookieConsentSettings.settingsModalAcceptAll,
                        //- reject_all_btn: this.cookieConsentSettings.settingsModalRejectAll,
                        close_btn_label: this.cookieConsentSettings.settingsModalClose,
                        blocks: [
                            {
                                title: this.cookieConsentSettings.settingsModalSubtitle,
                                description: this.cookieConsentSettings.settingsModalDescription,
                            }, {
                                title: this.cookieConsentSettings.settingsModalStrictlyNecessaryTitle,
                                description: this.cookieConsentSettings.settingsModalStrictlyNecessaryDescription,
                                toggle: {
                                    value: "necessary",
                                    enabled: true,
                                    readonly: true
                                }
                            }, {
                                title: this.cookieConsentSettings.settingsModalPerformanceAndAnalyticsTitle,
                                description: this.cookieConsentSettings.settingsModalPerformanceAndAnalyticsDescription,
                                toggle: {
                                    value: "analytics",
                                    enabled: true,
                                    readonly: false
                                }
                            }, {
                                title: this.cookieConsentSettings.settingsModalMoreInformationTitle,
                                description: this.cookieConsentSettings.settingsModalMoreInformationDescription
                            }
                        ]
                    }
                }
            }
        });

        _debug("Cookie Consents - Initialized!");
    }

    function _getCookie(cookieName) {
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
    }

    function _showPopup(url, title, w, h) {
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
    }

    function _debug(message) {
        // console.debug(message);
    }
      
    Gallery.prototype.Start = function () {
        _initGoogleAnalytics.call(this);
        _initCookieConsents.call(this);
    }

    Gallery.prototype.ChangeLanguage = function (language, currentSlug) {
        var expiresDays = 365;
        var expires = "";
        var date = new Date();
        date.setTime(date.getTime() + (expiresDays * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
        document.cookie = "brunocostagallery.language" + "=" + language + expires + "; path=/";

        window.location = currentSlug;
    }

    Gallery.prototype.ShowCookiePolicyPopup = function (slug, title) {
        _showPopup(slug, title, 720, 480);
    }
      
    return Gallery;
  
}());
