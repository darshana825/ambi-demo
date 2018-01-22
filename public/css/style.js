import React, {StyleSheet, Dimensions} from "react-native";
const {width, height, scale} = Dimensions.get("window"),
    vw = width / 100,
    vh = height / 100,
    vmin = Math.min(vw, vh),
    vmax = Math.max(vw, vh);

export default StyleSheet.create({
    "body": {
        "WebkitFontSmoothing": "antialiased",
        "background": "#F0EFEF"
    },
    "row": {
        "paddingBottom": 0
    },
    "row-clr": {
        "marginLeft": "0px !important",
        "marginRight": "0px !important"
    },
    "pg-middle-sign-wrapper": {
        "position": "relative"
    },
    "pg-middle-sign-wrapper > container-fluid": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "minHeight": 80 * vh
    },
    "a": {
        "outline": 0
    },
    "a:focus": {
        "outline": 0
    },
    "pg-top-navigation": {
        "backgroundColor": "#edf5f9",
        "boxShadow": "0 1px 3px -2px #000",
        "height": 70,
        "paddingTop": 7,
        "paddingRight": 0,
        "paddingBottom": 7,
        "paddingLeft": 0,
        "position": "fixed",
        "width": "100%",
        "zIndex": 400
    },
    "pg-top-navigation container-fluid": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto",
        "width": "calc(100% - 220px)"
    },
    "signup-header pg-custom-container": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "pg-logo-wrapper": {},
    "pgs-main-nav-area ul": {
        "paddingLeft": 0,
        "marginBottom": 0,
        "textAlign": "right",
        "paddingTop": 19
    },
    "pgs-main-nav-area ul li": {
        "listStyle": "none",
        "float": "left"
    },
    "pgs-main-nav-area ul:after": {
        "visibility": "hidden",
        "display": "block",
        "fontSize": 0,
        "content": "\" \"",
        "clear": "left",
        "height": 0
    },
    "pgs-login-area": {
        "marginTop": 12
    },
    "pgs-login-area inputWrapper": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "marginTop": 0,
        "marginRight": 10,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pgs-login-area inputWrapper:last-child": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pgs-login-area inputWrapper pgs-sign-inputs": {
        "fontSize": 9,
        "height": 27,
        "background": "#f6fafc"
    },
    "pgs-login-area inputWrapper form-control::-moz-placeholder": {
        "color": "#b5c9d6"
    },
    "pgs-login-area btnHolder": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pgs-login-area btnHolder pgs-sign-submit": {
        "height": 29,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "fontSize": 11
    },
    "pgs-login-area passwordHolder": {
        "textAlign": "right"
    },
    "pgs-login-area passwordHolder a": {
        "textDecoration": "none",
        "color": "#61b3de",
        "fontSize": 10,
        "textAlign": "right"
    },
    "pgs-login-area userNameHolder checkbox": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "float": "left"
    },
    "pgs-login-area userNameHolder checkbox label": {
        "textTransform": "capitalize",
        "fontSize": 10,
        "color": "#7795a8",
        "paddingLeft": 16,
        "position": "relative"
    },
    "pgs-login-area input-field": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "pgs-login-area form-group p": {
        "display": "none !important"
    },
    "pgs-login-area form-group invalid-msg": {
        "display": "none !important"
    },
    "pgs-login-area userNameHolder input[type=checkbox]": {
        "display": "none"
    },
    "pgs-login-area userNameHolder input[type=checkbox] + label:before": {
        "content": "\"\"",
        "fontFamily": "FontAwesome",
        "position": "absolute",
        "left": 0,
        "top": -1,
        "display": "inline-block",
        "width": 13,
        "height": 13,
        "background": "url(../images/forgot-pwd-bg.png) no-repeat 0 0",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 1,
        "letterSpacing": 5
    },
    "pgs-login-area userNameHolder input[type=checkbox]:checked + label:before": {
        "content": "\"\\f00c\"",
        "color": "#66b5df",
        "fontSize": 9,
        "letterSpacing": 5
    },
    "pgs-middle-sign-wrapperforgotPassword h2": {
        "paddingBottom": 20
    },
    "pgs-middle-sign-wrapperforgotPassword introWrapper": {
        "textAlign": "center",
        "marginBottom": 20
    },
    "pgs-middle-sign-wrapperchangedPassword introWrapper": {
        "textAlign": "center",
        "marginBottom": 15,
        "marginTop": 15,
        "marginRight": 0,
        "marginLeft": 0
    },
    "forgotPassword introWrapper p": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pgs-middle-sign-wrapperchangedPassword pgs-sign-submit-cancel": {
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto",
        "background": "#61b3de",
        "paddingTop": 10,
        "paddingRight": 0,
        "paddingBottom": 10,
        "paddingLeft": 0
    },
    "pgs-middle-sign-wrapperchangedPassword welcomeUser": {
        "color": "#61b3de"
    },
    "pgs-middle-sign-wrapperchangedPassword h2": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "pg-header-search": {
        "backgroundColor": "rgba(246, 250, 252, 0.5)",
        "border": "1px solid #68b6e3",
        "borderRadius": 5,
        "marginTop": 8,
        "paddingTop": 10,
        "paddingRight": 18,
        "paddingBottom": 10,
        "paddingLeft": 18,
        "position": "relative"
    },
    "pg-header-search react-autosuggest__container react-autosuggest__input": {
        "backgroundColor": "transparent",
        "border": "medium none",
        "color": "#9dadbd",
        "font": "13px \"montserratregular\",sans-serif",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "width": "100%",
        "outline": "none"
    },
    "pg-header-search react-autowhatever-1": {
        "top": 48,
        "width": "100%"
    },
    "pg-header-search react-autowhatever-1 a:hover": {
        "textDecoration": "none"
    },
    "pg-header-search react-autowhatever-1 suggestion": {
        "overflow": "hidden",
        "position": "relative"
    },
    "pg-header-search react-autowhatever-1 suggestion img-holder": {
        "width": 30,
        "height": 30,
        "marginRight": 15,
        "float": "left"
    },
    "pg-header-search react-autowhatever-1 suggestion span": {
        "float": "left",
        "marginTop": 8,
        "lineHeight": 1,
        "textTransform": "capitalize",
        "font": "12px 'montserratregular', sans-serif",
        "color": "#2d5164"
    },
    "pg-header-search search-icon": {
        "position": "absolute",
        "right": 18,
        "top": 14
    },
    "pg-header-options": {
        "paddingTop": 8,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "pg-header-options dropDown-holder": {
        "display": "inline-block",
        "marginRight": 7,
        "verticalAlign": "top",
        "cursor": "pointer"
    },
    "pg-header-options dropDown-holder:last-child": {
        "marginRight": 0
    },
    "pg-header-options a:last-child": {
        "marginRight": 0
    },
    "pg-top-hover-ico": {
        "display": "none"
    },
    "chat-dropdown-holderchat-notification-wrapper-opened pg-top-defalt-ico": {
        "display": "none"
    },
    "dropDown-holder:hover pg-top-defalt-ico": {
        "display": "none"
    },
    "chat-dropdown-holderchat-notification-wrapper-opened pg-top-hover-ico": {
        "display": "block"
    },
    "dropDown-holder:hover pg-top-hover-ico": {
        "display": "block"
    },
    "chat-dropdown-link-holder": {
        "borderBottom": "1px solid #dee6eb",
        "paddingTop": 5,
        "paddingRight": 15,
        "paddingBottom": 8,
        "paddingLeft": 15,
        "background": "#fff",
        "textAlign": "center"
    },
    "chat-dropdown-link-holder a": {
        "color": "#61b3de",
        "cursor": "pointer",
        "font": "10px \"montserratregular\",sans-serif",
        "marginTop": 5,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "textAlign": "center",
        "display": "block"
    },
    "chat-dropdown-link-holder a:hover": {
        "textDecoration": "none"
    },
    "pg-drop-down": {
        "position": "relative"
    },
    "pg-top-profile-pic-box": {
        "height": 70,
        "position": "absolute",
        "right": 0,
        "top": 0,
        "width": 110,
        "overflow": "hidden"
    },
    "pg-top-profile-pic-box proImgholder": {
        "height": 75,
        "width": 75,
        "float": "right",
        "zIndex": 1,
        "position": "relative"
    },
    "pg-top-profile-pic-box proImgholder img": {
        "height": "auto",
        "width": "100%"
    },
    "pg-top-profile-pic-options": {
        "backgroundColor": "rgba(0, 0, 0, 0.3)",
        "height": "100%",
        "paddingLeft": 10,
        "paddingRight": 10,
        "position": "absolute",
        "top": 0
    },
    "pg-top-profile-pic-options a": {
        "display": "block",
        "marginTop": 13
    },
    "pgs-main-nav-area ul li a": {
        "font": "13px 'montserratregular', sans-serif",
        "color": "#7795a8",
        "textDecoration": "none",
        "textTransform": "uppercase",
        "marginLeft": 15
    },
    "pgs-main-btn-sign": {
        "backgroundColor": "#61b3de",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "font": "13px 'montserratregular', sans-serif",
        "color": "#fff",
        "textDecoration": "none !important",
        "textAlign": "center",
        "paddingTop": 12,
        "paddingRight": 0,
        "paddingBottom": 12,
        "paddingLeft": 0,
        "width": 88,
        "display": "inline-block",
        "verticalAlign": "top",
        "textTransform": "uppercase",
        "marginRight": 8,
        "float": "right",
        "marginTop": 8
    },
    "pgs-main-btn-sign:hover": {
        "color": "#fff"
    },
    "pgs-main-btn-sign:focus": {
        "color": "#fff"
    },
    "pgs-main-btn-sign:after": {
        "visibility": "hidden",
        "display": "block",
        "fontSize": 0,
        "content": "\" \"",
        "clear": "right",
        "height": 0
    },
    "pgs-main-btn-login": {
        "backgroundColor": "#a4becd",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "font": "13px 'montserratregular', sans-serif",
        "color": "#fff",
        "textDecoration": "none !important",
        "textAlign": "center",
        "paddingTop": 12,
        "paddingRight": 0,
        "paddingBottom": 12,
        "paddingLeft": 0,
        "width": 88,
        "display": "inline-block",
        "verticalAlign": "top",
        "textTransform": "uppercase",
        "float": "right",
        "marginTop": 8
    },
    "pgs-main-btn-login:hover": {
        "color": "#fff"
    },
    "pgs-main-btn-login:focus": {
        "color": "#fff"
    },
    "pgs-main-btn-login:after": {
        "visibility": "hidden",
        "display": "block",
        "fontSize": 0,
        "content": "\" \"",
        "clear": "right",
        "height": 0
    },
    "pgs-middle-sign-wrapper": {
        "paddingTop": 95,
        "minHeight": 100 * vh
    },
    "pgs-middle-sign-wrapperchangePassword": {
        "paddingTop": "13%"
    },
    "pgs-middle-sign-wrapperchangedPassword": {
        "paddingTop": "13%"
    },
    "pgs-middle-sign-wrapperforgotPassword": {
        "paddingTop": "13%"
    },
    "pgs-middle-sign-wrapper-inner": {
        "float": "none",
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto"
    },
    "pgs-middle-sign-wrapper-inner-cover": {
        "backgroundColor": "#fff",
        "boxShadow": "0px 0px 4px -2px #020202",
        "WebkitBorderRadius": 5,
        "MozBorderRadius": 5,
        "borderRadius": 5,
        "paddingTop": 50,
        "paddingRight": 35,
        "paddingBottom": 40,
        "paddingLeft": 35
    },
    "pgs-middle-sign-wrapper-inner-cover h2": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "26px 'montserratlight', sans-serif",
        "color": "#2d5164",
        "textTransform": "uppercase",
        "textAlign": "center",
        "paddingBottom": 40
    },
    "pgs-middle-sign-wrapper-inner-form p": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "9px 'montserratsemi_bold', sans-serif",
        "color": "#7795a8",
        "textTransform": "uppercase",
        "paddingBottom": 5
    },
    "pgs-middle-sign-wrapper-inner-form input-field": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 25,
        "marginLeft": 0
    },
    "pgs-sign-inputs": {
        "width": "100%",
        "font": "12px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "border": "1px solid #d7e2ea",
        "backgroundColor": "#fff",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "paddingTop": 5,
        "paddingRight": 14,
        "paddingBottom": 5,
        "paddingLeft": 14,
        "height": 36,
        "lineHeight": 1
    },
    "pgs-sign-inputs:focus": {
        "outline": 0
    },
    "pgs-sign-inputs::-webkit-input-placeholder": {
        "color": "#2d5164"
    },
    "pgs-sign-inputs:-moz-placeholder": {
        "color": "#2d5164"
    },
    "pgs-sign-inputs::-moz-placeholder": {
        "color": "#2d5164"
    },
    "pgs-sign-inputs:-ms-input-placeholder": {
        "color": "#2d5164"
    },
    "pg-profile-page": {
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 140,
        "marginLeft": "auto",
        "paddingTop": 70,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "width": "calc(100% - 220px)",
        "zIndex": 1,
        "position": "relative"
    },
    "cover-image-wrapper": {
        "height": 299,
        "position": "relative"
    },
    "cover-image-wrapper pg-profile-cover-banner": {
        "height": "100%",
        "minWidth": "100%",
        "minHeight": "100%"
    },
    "cover-image-wrapper imageSelector": {
        "position": "absolute",
        "top": 0,
        "left": 0,
        "width": "100%",
        "height": "100%"
    },
    "cover-image-wrapper imageSelector a": {
        "display": "block",
        "width": "100%",
        "height": "100%",
        "cursor": "pointer"
    },
    "imgUploadBtnHolder": {
        "marginTop": 15
    },
    "imgUploadBtnHolder coverImgUpload input[type=\"file\"]": {
        "display": "none"
    },
    "imgUploadBtnHolder coverImgUpload": {
        "float": "left"
    },
    "imgUploadBtnHolder pgs-sign-submit": {
        "cursor": "pointer",
        "paddingTop": 8,
        "paddingRight": 10,
        "paddingBottom": 8,
        "paddingLeft": 10,
        "fontSize": 12,
        "width": "auto"
    },
    "cover-image-wrapper imageSelector a:hover": {
        "border": "3px dashed #eceef1",
        "background": "rgba(24, 39, 56, 0.3)"
    },
    "noImage": {
        "width": "100%",
        "textAlign": "center",
        "marginTop": 15,
        "marginRight": 0,
        "marginBottom": 15,
        "marginLeft": 0
    },
    "progressBarHolder": {
        "marginTop": 15,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pg-middle-sign-wrapper loggedUserView": {
        "paddingTop": 70
    },
    "pgs-custom-container": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "width": "calc(100% - 220px)",
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto"
    },
    "cover-image-wrapper action-btn-holder": {
        "position": "absolute",
        "bottom": 55,
        "right": 15
    },
    "cover-image-wrapper action-btn-holder btn": {
        "marginRight": 5,
        "background": "rgba(255, 255, 255, 0.8)",
        "font": "12px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "border": 0
    },
    "cover-image-wrapper action-btn-holder btn:hover": {
        "background": "rgba(255, 255, 255, 1)"
    },
    "pgs-sign-submit-cancel": {
        "border": "none",
        "backgroundColor": "#a4becd",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "font": "13px 'montserratregular', sans-serif",
        "color": "#fff",
        "textDecoration": "none !important",
        "textAlign": "center",
        "paddingTop": 12,
        "paddingRight": 0,
        "paddingBottom": 12,
        "paddingLeft": 0,
        "width": 88,
        "display": "block",
        "textTransform": "uppercase"
    },
    "pgs-sign-submit": {
        "border": "none",
        "backgroundColor": "#61b3de",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "font": "13px 'montserratregular', sans-serif",
        "color": "#fff",
        "textDecoration": "none !important",
        "textAlign": "center",
        "paddingTop": 12,
        "paddingRight": 0,
        "paddingBottom": 12,
        "paddingLeft": 0,
        "width": 88,
        "display": "block",
        "textTransform": "uppercase",
        "float": "right"
    },
    "pgs-sign-submit:after": {
        "visibility": "hidden",
        "display": "block",
        "fontSize": 0,
        "content": "\" \"",
        "clear": "right",
        "height": 0
    },
    "pg-left-nav-wrapper": {
        "backgroundColor": "rgba(13, 29, 50, 0.3)",
        "position": "fixed",
        "left": 0,
        "height": "calc(100vh - 180px)",
        "width": 110,
        "top": 70,
        "zIndex": 1
    },
    "pg-right-nav-wrapper": {
        "backgroundColor": "rgba(13, 29, 50, 0.3)",
        "position": "fixed",
        "width": 110,
        "right": 0,
        "height": "calc(100vh - 180px)",
        "top": 70,
        "zIndex": 1
    },
    "pg-right-nav-wrapperworkmode-switched": {
        "backgroundColor": "transparent"
    },
    "pg-nav-item-wrapper": {
        "paddingTop": 24,
        "paddingRight": 0,
        "paddingBottom": 24,
        "paddingLeft": 0,
        "borderBottom": "2px solid #e0e2e5",
        "height": "calc((100vh - 180px)/4)",
        "position": "relative"
    },
    "pg-nav-item-wrapper:last-child": {
        "borderBottom": 0
    },
    "pg-nav-item-wrapper a": {
        "textDecoration": "none",
        "position": "absolute",
        "top": 0,
        "bottom": 0,
        "left": 0,
        "right": 0,
        "marginTop": "auto",
        "marginRight": "auto",
        "marginBottom": "auto",
        "marginLeft": "auto",
        "height": 50
    },
    "pg-nav-item-wrapper a:hover": {
        "textDecoration": "none"
    },
    "pg-nav-item-wrapper img": {
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 12,
        "marginLeft": "auto"
    },
    "pg-nav-item-wrapper p": {
        "textAlign": "center",
        "font": "9px 'montserratregular', sans-serif",
        "color": "#fff",
        "marginBottom": 0,
        "textTransform": "uppercase"
    },
    "signupContentHolder": {
        "position": "relative",
        "marginBottom": "10%"
    },
    "signupContentHolder pgs-secratery-img": {
        "left": -130,
        "position": "absolute",
        "top": 0
    },
    "pgs-middle-sign-wrapper-inner-cover-secretary h2": {
        "paddingBottom": 15
    },
    "pgs-middle-sign-wrapper-inner-cover-secretary h5": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "16px 'montserratlight', sans-serif",
        "color": "#2d5164",
        "textAlign": "center",
        "paddingBottom": 40
    },
    "pgs-middle-sign-wrapper-secratery-box": {
        "paddingTop": 9,
        "paddingRight": 9,
        "paddingBottom": 9,
        "paddingLeft": 9,
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "border": "1px solid #e1e6ea",
        "marginBottom": 35
    },
    "pgs-secratery-pic": {
        "position": "relative"
    },
    "pgs-sec-pro-cam": {
        "position": "absolute",
        "bottom": 7,
        "right": 6
    },
    "pgs-secratery-content-box": {
        "paddingLeft": 0
    },
    "pgs-secratery-content-box h3": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "14px 'montserratsemi_bold', sans-serif",
        "color": "#2d5164",
        "textTransform": "capitalize",
        "paddingBottom": 5,
        "paddingTop": 10
    },
    "pgs-secratery-content-box h4": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "9px 'montserratsemi_bold', sans-serif",
        "color": "#61b3de",
        "textTransform": "uppercase",
        "paddingBottom": 13
    },
    "pgs-secratery-content-box h4 a": {
        "textDecoration": "none !important",
        "color": "#61b3de"
    },
    "pgs-secratery-content-box h6": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "10px 'montserratregular', sans-serif",
        "color": "#7795a8"
    },
    "pgs-sign-submit-back": {
        "textDecoration": "none !important"
    },
    "pgs-sign-submit-back:hover": {
        "color": "#fff"
    },
    "pgs-sign-submit-back:focus": {
        "color": "#fff"
    },
    "pgs-middle-sign-wrapper-secratery-box-active": {
        "borderColor": "#61b3de",
        "boxShadow": "0px 0px 5px -1px #000"
    },
    "pgs-sec-active-pic": {
        "display": "none"
    },
    "pgs-middle-sign-wrapper-secratery-box:hover pgs-sec-active-pic": {
        "display": "block"
    },
    "pgs-middle-sign-wrapper-secratery-box:hover pgs-sec-default-pic": {
        "display": "none"
    },
    "pgs-middle-sign-wrapper-secratery-box-active pgs-sec-active-pic": {
        "display": "block"
    },
    "pgs-middle-sign-wrapper-secratery-box-active pgs-sec-default-pic": {
        "display": "none"
    },
    "pgs-middle-sign-wrapper-secratery-box-active pbs-default-text": {
        "display": "none"
    },
    "pgs-middle-sign-wrapper-secratery-box-active pbs-active-text": {
        "display": "block !important"
    },
    "pgs-middle-about-wrapper": {
        "height": "100%",
        "paddingTop": 130,
        "paddingBottom": 50,
        "position": "relative",
        "zIndex": 500,
        "backgroundColor": "rgba(0, 0, 0, 0.6)"
    },
    "pgs-sign-left-arrow": {
        "position": "absolute",
        "left": -9,
        "top": -8
    },
    "pgs-middle-sign-wrapper-about": {
        "boxShadow": "0px 0px 11px -1px #020202",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "borderTopLeftRadius": 0,
        "WebkitBorderTopLeftRadius": 0,
        "MozBorderRadiusTopleft": 0
    },
    "ProgressBarHolder": {
        "width": "100%",
        "height": "100%",
        "background": "rgba(0, 0, 0, 0.7)",
        "position": "absolute",
        "top": 0,
        "left": 0
    },
    "ProgressBarHolder loadFacebookG": {
        "top": "50%",
        "position": "absolute",
        "left": "50%"
    },
    "pgs-middle-sign-wrapper-about-inner": {
        "paddingTop": 50,
        "paddingRight": 35,
        "paddingBottom": 40,
        "paddingLeft": 35,
        "borderBottom": "1px solid #dee6eb"
    },
    "pgs-secratery-img img": {
        "boxShadow": "0px 0px 11px -1px #020202"
    },
    "pgs-middle-sign-wrapper-about h1": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "26px 'montserratlight', sans-serif",
        "color": "#61b3de",
        "textTransform": "uppercase",
        "textAlign": "center"
    },
    "pgs-middle-sign-wrapper-about h2": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "22px 'montserratlight', sans-serif",
        "color": "#2d5164",
        "paddingBottom": 30
    },
    "pgs-middle-sign-wrapper-about h5": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "16px 'montserratlight', sans-serif",
        "color": "#2d5164",
        "lineHeight": 24,
        "paddingBottom": 0
    },
    "pgs-middle-sign-wrapper-about-inner-form": {
        "backgroundColor": "#f2f6f9",
        "paddingTop": 30,
        "paddingRight": 40,
        "paddingBottom": 40,
        "paddingLeft": 40
    },
    "pgs-middle-sign-wrapper-about-inner-form h6": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "16px 'montserratlight', sans-serif",
        "color": "#2d5164",
        "textAlign": "center",
        "paddingBottom": 25
    },
    "pgs-middle-about-inputs pgs-sign-inputs": {
        "backgroundColor": "#f8fbfc",
        "paddingTop": 9,
        "paddingRight": 13,
        "paddingBottom": 9,
        "paddingLeft": 13
    },
    "input[type=number]": {
        "MozAppearance": "textfield"
    },
    "input[type=number]::-webkit-inner-spin-button": {
        "WebkitAppearance": "none",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "input[type=number]::-webkit-outer-spin-button": {
        "WebkitAppearance": "none",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pgs-sign-select": {
        "width": "100%",
        "WebkitAppearance": "none",
        "MozAppearance": "none",
        "background": "url(../images/select-arrow.png) no-repeat 92% center",
        "font": "12px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "border": "1px solid #d7e2ea",
        "backgroundColor": "#f8fbfc",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "paddingTop": 9,
        "paddingRight": 10,
        "paddingBottom": 9,
        "paddingLeft": 10,
        "marginBottom": 25
    },
    "pgs-sign-select-about-col": {
        "float": "left",
        "marginRight": 15
    },
    "pgs-sign-select-about-col:after": {
        "visibility": "hidden",
        "display": "block",
        "fontSize": 0,
        "content": "\" \"",
        "clear": "left",
        "height": 0
    },
    "pgs-sign-select-about-col:last-child": {
        "marginRight": 0
    },
    "pgs-sign-select-about-col pgs-sign-select": {
        "background": "url(../images/select-arrow.png) no-repeat 88% center",
        "backgroundColor": "#f8fbfc",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pgs-sign-about-submit-inputs": {
        "marginTop": 10
    },
    "pgs-middle-sign-wrapper-about-inner-establish-conn": {
        "paddingTop": 30,
        "paddingRight": 30,
        "paddingBottom": 30,
        "paddingLeft": 30
    },
    "pgs-middle-sign-wrapper-about-inner-establish-conn h2": {
        "paddingBottom": 0
    },
    "pgs-sign-about-skip:hover": {
        "color": "#fff"
    },
    "pgs-sign-about-skip:focus": {
        "color": "#fff"
    },
    "pgs-establish-connection-cover": {
        "border": "1px solid #d6e1ea",
        "backgroundColor": "#f8fbfc",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "height": 325,
        "marginBottom": 30
    },
    "pgs-establish-connection-box": {
        "borderBottom": "1px solid #d6e1ea",
        "paddingTop": 10,
        "paddingRight": 15,
        "paddingBottom": 10,
        "paddingLeft": 15
    },
    "pgs-establish-connection-box h3": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "14px 'montserratsemi_bold', sans-serif",
        "color": "#2d5164",
        "textTransform": "capitalize",
        "paddingTop": 5,
        "paddingBottom": 2
    },
    "pgs-establish-connection-box p": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "10px 'montserratregular', sans-serif",
        "color": "#2d5164"
    },
    "pgs-establish-connection-box a": {
        "cursor": "pointer",
        "textDecoration": "none",
        "backgroundColor": "#61b3de",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "width": 110,
        "paddingTop": 9,
        "paddingRight": 0,
        "paddingBottom": 9,
        "paddingLeft": 0,
        "display": "block",
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#fff",
        "textTransform": "uppercase",
        "textAlign": "center",
        "float": "right",
        "marginTop": 5
    },
    "pgs-establish-connection-box a:after": {
        "visibility": "hidden",
        "display": "block",
        "fontSize": 0,
        "content": "\" \"",
        "clear": "right",
        "height": 0
    },
    "pgs-establish-pro-pic": {
        "width": "14%"
    },
    "pgs-establish-pro-detail": {
        "paddingLeft": 0,
        "width": "52%"
    },
    "mCSB_scrollTools mCSB_draggerContainer": {
        "top": -13,
        "left": 15
    },
    "pgs-news-read-box": {
        "float": "left",
        "marginBottom": 10,
        "marginLeft": "10px !important",
        "marginRight": "10px !important",
        "marginTop": 10,
        "width": 110,
        "paddingBottom": 0,
        "position": "relative"
    },
    "pgs-news-read-box:after": {
        "visibility": "hidden",
        "display": "block",
        "fontSize": 0,
        "content": "\" \"",
        "clear": "left",
        "height": 0
    },
    "pgs-middle-sign-wrapper-news-inner-form": {
        "backgroundColor": "#f2f6f9",
        "paddingTop": 0,
        "paddingRight": 35,
        "paddingBottom": 40,
        "paddingLeft": 35
    },
    "pgs-middle-sign-wrapper-news-inner-form h6": {
        "paddingTop": 20,
        "paddingBottom": 15
    },
    "pgs-news-main-cover-img": {
        "width": "100%",
        "position": "relative"
    },
    "pgs-news-read-box-content": {
        "position": "absolute",
        "left": 0,
        "right": 0,
        "bottom": 25,
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto"
    },
    "pgs-news-read-box-content img": {
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto"
    },
    "pgs-news-read-box-content p": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "12px 'montserratsemi_bold', sans-serif",
        "color": "#fff",
        "textTransform": "capitalize",
        "textAlign": "center",
        "paddingTop": 10
    },
    "pgs-news-read-select": {
        "position": "absolute",
        "right": -5,
        "top": 5
    },
    "pg-interest-options-row": {
        "float": "right",
        "paddingTop": 3,
        "width": 464
    },
    "pg-my-con-option": {
        "display": "inline-block",
        "marginLeft": 19,
        "verticalAlign": "top"
    },
    "pb-find-job-upload-button": {
        "paddingTop": 6,
        "paddingRight": 0,
        "paddingBottom": 8,
        "paddingLeft": 0,
        "color": "#fff",
        "float": "right",
        "marginTop": 0,
        "marginRight": 5,
        "marginBottom": 0,
        "marginLeft": 0,
        "textDecoration": "none !important",
        "width": 100,
        "backgroundImage": "linear-gradient(to bottom, #61b2de 0%, #0272ae 72%)",
        "borderRadius": 4,
        "display": "block",
        "font": "10px \"montserratsemi_bold\",sans-serif",
        "height": 25,
        "textAlign": "center",
        "textTransform": "uppercase"
    },
    "pg-interest-options-sort select": {
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "MozAppearance": "none",
        "backgroundColor": "#fff",
        "backgroundImage": "url(\"../images/select-1.png\")",
        "backgroundPosition": "90% center",
        "backgroundRepeat": "no-repeat",
        "border": "1px solid #59afe1",
        "borderRadius": 4,
        "color": "#2d5164",
        "font": "10px \"montserratregular\",sans-serif",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "outline": "medium none",
        "textIndent": 0.01,
        "textOverflow": "\"\"",
        "width": "100%"
    },
    "pg-my-con-option-view": {
        "width": 60
    },
    "pb-t-note-head-list": {
        "background": "#fff",
        "border": "1px solid #59afe1",
        "borderRadius": 4,
        "float": "right",
        "marginTop": 0,
        "marginRight": 10,
        "marginBottom": 5,
        "marginLeft": 0
    },
    "pb-t-note-head-list-replica": {
        "float": "none",
        "width": 60
    },
    "pb-t-note-head-list::after": {
        "clear": "left",
        "content": "\" \"",
        "display": "block",
        "fontSize": 0,
        "height": 0,
        "visibility": "hidden"
    },
    "pb-t-note-head-list-item": {
        "float": "left",
        "width": 29
    },
    "pb-t-note-head-active": {
        "background": "#3c5166",
        "borderRadius": 4
    },
    "pb-t-note-head-list a": {
        "display": "block",
        "paddingTop": 2,
        "paddingRight": 2,
        "paddingBottom": 2,
        "paddingLeft": 2,
        "textAlign": "center"
    },
    "pg-interest-options-search input": {
        "paddingTop": 7,
        "paddingRight": 5,
        "paddingBottom": 8,
        "paddingLeft": 5,
        "backgroundColor": "#fff",
        "border": "1px solid #59afe1",
        "borderRadius": 4,
        "color": "#9dadbd",
        "font": "10px \"montserratregular\",sans-serif",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "width": "100%"
    },
    "pgs-news-read-select input[type=\"checkbox\"]": {
        "display": "none",
        "verticalAlign": "top",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pgs-news-read-select label": {
        "font": "14px 'montserratsemi_bold'",
        "color": "#5f5f5f",
        "marginBottom": 0
    },
    "pgs-news-read-select input[type=\"checkbox\"] + label:before": {
        "border": "1px solid #fff",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "content": "\"\"",
        "display": "inline-block",
        "font": "12px 'montserratbold'",
        "color": "#5f5f5f",
        "height": 15,
        "width": 15,
        "marginTop": 2,
        "marginRight": 15,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "verticalAlign": "top",
        "cursor": "pointer"
    },
    "pgs-news-read-select input[type=\"checkbox\"]:checked + label:before": {
        "background": "#fff",
        "color": "#61b3de",
        "content": "\"\\2714\"",
        "textAlign": "center",
        "lineHeight": 14
    },
    "pgs-news-read-selectinput[type=\"checkbox\"]:checked + label:after": {},
    "current-check": {
        "boxShadow": "0px 0px 12px 0px #020202"
    },
    "pgs-news-read-cover": {
        "marginBottom": 30,
        "overflow": "auto",
        "width": "auto"
    },
    "pgs-news-read-cover pgs-news-read-cover-inner": {
        "minWidth": 650,
        "overflow": "hidden",
        "width": "auto"
    },
    "pgs-news-read-cover mCSB_scrollTools mCSB_draggerContainer": {
        "top": 15,
        "left": 0
    },
    "pgs-middle-sign-wrapper-complete-inner-form p": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "16px 'montserratlight', sans-serif",
        "color": "#2d5164",
        "textAlign": "center",
        "textTransform": "none"
    },
    "Profile-pic-main": {
        "backgroundColor": "#fff",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "boxShadow": "0px 0px 5px -2px #c6d0d8",
        "border": "1px solid #c6d0d8",
        "width": 190,
        "marginTop": 30,
        "marginRight": "auto",
        "marginBottom": 30,
        "marginLeft": "auto"
    },
    "Profile-pic-uploaded": {
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3
    },
    "Profile-pic-display-area": {
        "marginBottom": 10
    },
    "Profile-pic-display-area imgUpload": {
        "display": "none"
    },
    "Profile-pic-display-area previewProfileImg": {
        "width": "100%",
        "height": "auto"
    },
    "Profile-pic-display-btn-area label": {
        "textDecoration": "none !important",
        "backgroundColor": "#a4becd",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#fff",
        "textAlign": "center",
        "paddingTop": 7,
        "paddingRight": 20,
        "paddingBottom": 7,
        "paddingLeft": 20,
        "width": "auto",
        "display": "inline-block",
        "textTransform": "uppercase",
        "cursor": "pointer",
        "marginTop": 3,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pgs-sign-submit-capture:after": {
        "visibility": "hidden",
        "display": "block",
        "fontSize": 0,
        "content": "\" \"",
        "clear": "left",
        "height": 0
    },
    "pgs-sign-upload": {
        "textDecoration": "none !important",
        "backgroundColor": "#61b3de",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "borderRadius": 3,
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#fff",
        "textAlign": "center",
        "paddingTop": 7,
        "paddingRight": 0,
        "paddingBottom": 7,
        "paddingLeft": 0,
        "width": 70,
        "display": "block",
        "textTransform": "uppercase",
        "float": "right"
    },
    "Profile-pic-display-btn-area": {
        "textAlign": "center"
    },
    "pgs-sign-upload:after": {
        "visibility": "hidden",
        "display": "block",
        "fontSize": 0,
        "content": "\" \"",
        "clear": "right",
        "height": 0
    },
    "Profile-pic-display-btn-area:after": {
        "visibility": "hidden",
        "display": "block",
        "fontSize": 0,
        "content": "\" \"",
        "clear": "both",
        "height": 0
    },
    "Profile-pic-display-btn-area a": {
        "color": "#fff",
        "textDecoration": "none"
    },
    "Profile-pic-display-btn-area a:hover": {
        "color": "#fff",
        "textDecoration": "none"
    },
    "pg-footer-wrapper": {
        "position": "fixed",
        "width": "100%",
        "bottom": 0,
        "zIndex": 1,
        "height": 110,
        "backgroundColor": "#eceef1",
        "boxShadow": "2px 1px 8px -2px #000"
    },
    "pg-footer-wrapperworkmode-switched": {
        "backgroundColor": "transparent",
        "boxShadow": "none",
        "zIndex": 0
    },
    "pg-footer-left-options-panel": {
        "width": 110,
        "height": 112,
        "backgroundColor": "#fff",
        "position": "absolute",
        "left": 0
    },
    "pg-footer-right-options-panel": {
        "paddingTop": 6,
        "paddingRight": 5,
        "paddingBottom": 5,
        "position": "absolute",
        "right": 0,
        "top": 0
    },
    "pg-footer-right-options-panel-inner": {
        "height": 100,
        "width": 105,
        "backgroundColor": "#61b3de",
        "WebkitBorderRadius": 5,
        "MozBorderRadius": 5,
        "borderRadius": 5,
        "paddingTop": 22,
        "cursor": "pointer"
    },
    "pg-footer-right-options-panel-inner img": {
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 15,
        "marginLeft": "auto"
    },
    "pg-footer-right-options-panel-inner p": {
        "textAlign": "center",
        "font": "9px 'montserratregular', sans-serif",
        "color": "#fff",
        "marginBottom": 0,
        "textTransform": "uppercase"
    },
    "pg-footer-right-options-panel-inner a": {
        "textDecoration": "none"
    },
    "pg-footer-slide-section": {
        "paddingTop": 15,
        "paddingBottom": 2
    },
    "row-rel": {
        "position": "relative"
    },
    "pg-footer-left-options-panel pgs-secratery-img": {
        "float": "none",
        "position": "relative",
        "height": 110,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "width": 80,
        "background": "#ECF6FC"
    },
    "pg-footer-left-options-panel pgs-secratery-img counter": {
        "position": "absolute",
        "top": 2,
        "right": 4,
        "paddingTop": 4,
        "paddingRight": 10,
        "paddingBottom": 4,
        "paddingLeft": 10,
        "display": "block",
        "color": "#fff",
        "background": "#e82107",
        "borderRadius": 999
    },
    "pg-footer-left-options-panel pgs-secratery-img img": {
        "height": "auto",
        "width": "100%",
        "boxShadow": "none",
        "position": "absolute",
        "left": 0,
        "bottom": 0
    },
    "pg-footer-left-options": {
        "backgroundColor": "#59afe1",
        "height": "100%",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "position": "absolute",
        "right": 0,
        "top": 0
    },
    "pg-footer-left-options img": {
        "marginTop": 18
    },
    "pg-footer-slide-box": {
        "backgroundColor": "#ffffff",
        "WebkitBorderRadius": 5,
        "MozBorderRadius": 5,
        "borderRadius": 5,
        "boxShadow": "0px 0px 3px -1px #000",
        "paddingTop": 20,
        "paddingRight": 5,
        "paddingBottom": 20,
        "paddingLeft": 5
    },
    "pg-footer-slide-box-img": {
        "paddingLeft": 15,
        "paddingRight": 10
    },
    "pg-footer-slide-box-content": {
        "paddingLeft": 0,
        "paddingRight": 10
    },
    "pg-footer-slide-box-content h5": {
        "font": "11px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pg-footer-slide-box-content a": {
        "textDecoration": "none",
        "font": "9px 'montserratsemi_bold', sans-serif",
        "color": "#59afe1",
        "display": "block",
        "marginTop": 3,
        "textTransform": "uppercase"
    },
    "pg-footer-top-control-panel": {
        "position": "absolute",
        "top": -27,
        "left": 0,
        "right": 0,
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto",
        "width": 174,
        "height": 28,
        "background": "url(../images/footer-screen-scale-sec.png) no-repeat",
        "backgroundSize": "100% 100%",
        "paddingTop": 5
    },
    "pg-footer-top-control-panel img": {
        "display": "inline-block",
        "verticalAlign": "middle",
        "marginTop": -1,
        "marginRight": 3
    },
    "pg-footer-top-control-panel a": {
        "font": "10px 'montserratregular', sans-serif",
        "color": "#7694a2",
        "textDecoration": "none",
        "textTransform": "uppercase",
        "marginRight": 13,
        "marginTop": 8,
        "display": "inline-block"
    },
    "pg-footer-top-control-panel a:first-child": {
        "marginLeft": 33
    },
    "pg-footer-top-control-panel a:last-child": {
        "marginLeft": 0
    },
    "pg-page": {
        "paddingBottom": 120,
        "minHeight": 80 * vh
    },
    "pg-profile-banner-area": {
        "paddingTop": 0,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 30,
        "marginLeft": 0,
        "position": "relative"
    },
    "pg-profile-banner-area action-btn": {
        "position": "absolute",
        "top": 20,
        "left": 20,
        "zIndex": 100,
        "background": "rgba(255, 255, 255, 0.8)",
        "borderRadius": 4,
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10,
        "textTransform": "none",
        "font": "10px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "cursor": "pointer"
    },
    "pg-profile-banner-area action-btn:focus": {
        "textDecoration": "none"
    },
    "pg-profile-banner-area action-btn:hover": {
        "textDecoration": "none"
    },
    "pg-profile-banner-area action-btn fa-plus": {
        "marginTop": 0,
        "marginRight": 5,
        "marginBottom": 0,
        "marginLeft": 5
    },
    "pg-profile-cover-banner": {
        "width": "100%",
        "position": "relative"
    },
    "pg-pro-share-btn": {
        "position": "absolute",
        "top": 20,
        "right": 20,
        "zIndex": 100,
        "background": "rgba(255, 255, 255, 0.8)",
        "borderRadius": 4,
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5
    },
    "pg-pro-share-btn img": {
        "display": "inline-block",
        "verticalAlign": "top",
        "paddingRight": 5,
        "paddingTop": 5
    },
    "pg-pro-share-btn a": {
        "display": "inline-block",
        "verticalAlign": "top",
        "font": "8px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pg-pro-share-btn p": {
        "display": "inline-block",
        "verticalAlign": "top",
        "font": "8px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pg-pro-share-btn a:hover": {
        "textDecoration": "none"
    },
    "pg-pro-share-btn a:focus": {
        "textDecoration": "none"
    },
    "pg-pro-share-btn pg-pro-share-btn-txt": {
        "color": "#2d5164",
        "font": "15px \"montserratregular\",sans-serif",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "display": "block"
    },
    "pg-pro-share-btnmutual-friends-holder": {
        "paddingBottom": 1,
        "cursor": "pointer"
    },
    "pg-pro-share-btnmutual-friends-holder pg-pro-share-btn-txt": {
        "float": "left",
        "marginRight": 5
    },
    "pg-profile-pic-detail-wrapper": {
        "bottom": 0,
        "width": "100%",
        "zIndex": 100,
        "background": "rgba(255, 255, 255, 0.4)",
        "minHeight": 40,
        "position": "absolute",
        "left": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "pg-profile-pic-detail-wrapper block-wrapper": {
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "center"
    },
    "pg-profile-pic-detail-wrapper block-wrapper profile-img-holder": {
        "alignSelf": "baseline"
    },
    "pg-profile-mid-wrapper": {
        "position": "absolute",
        "bottom": -72,
        "width": "100%"
    },
    "pg-profile-detail-work h3": {
        "fontSize": 20,
        "color": "#ffffff",
        "marginTop": 10
    },
    "pg-profile-detail-live h3": {
        "fontSize": 20,
        "color": "#ffffff",
        "marginTop": 10
    },
    "pg-profile-detail-name": {
        "position": "absolute",
        "minWidth": 500,
        "left": "50%",
        "marginLeft": -250,
        "top": -70,
        "color": "#ffffff",
        "fontSize": 30
    },
    "curr-job-holder": {
        "marginTop": 10
    },
    "curr-job-holder job-data": {
        "display": "none"
    },
    "curr-job-holder job-dataeditable": {
        "display": "inline-block",
        "background": "none",
        "borderRadius": 0,
        "border": "none",
        "maxWidth": "100%",
        "width": "auto",
        "textTransform": "capitalize",
        "color": "#fff",
        "font": "18px 'montserratregular', sans-serif",
        "whiteSpace": "nowrap",
        "overflow": "hidden",
        "textOverflow": "ellipsis",
        "borderBottom": "1px solid #fff"
    },
    "curr-job-holder job-dataeditable:focus": {
        "display": "inline-block",
        "background": "none",
        "borderRadius": 0,
        "border": "none",
        "maxWidth": "100%",
        "width": "auto",
        "textTransform": "capitalize",
        "color": "#fff",
        "font": "18px 'montserratregular', sans-serif",
        "whiteSpace": "nowrap",
        "overflow": "hidden",
        "textOverflow": "ellipsis"
    },
    "curr-job-holder job-dataeditable:hover": {
        "display": "inline-block",
        "background": "none",
        "borderRadius": 0,
        "border": "none",
        "maxWidth": "100%",
        "width": "auto",
        "textTransform": "capitalize",
        "color": "#fff",
        "font": "18px 'montserratregular', sans-serif",
        "whiteSpace": "nowrap",
        "overflow": "hidden",
        "textOverflow": "ellipsis"
    },
    "curr-job-holder designation-text": {
        "textTransform": "capitalize",
        "color": "#fff",
        "font": "18px 'montserratregular', sans-serif",
        "display": "inline-block",
        "marginTop": 0,
        "marginRight": 5,
        "marginBottom": 5,
        "marginLeft": 0
    },
    "curr-job-holder office-text": {
        "textTransform": "capitalize",
        "color": "#fff",
        "font": "18px 'montserratregular', sans-serif",
        "display": "inline-block",
        "marginTop": 0,
        "marginRight": 5,
        "marginBottom": 5,
        "marginLeft": 0
    },
    "curr-job-holder designation-texteditable": {
        "display": "none"
    },
    "curr-job-holder office-texteditable": {
        "display": "none"
    },
    "curr-job-holder combine-text": {
        "color": "#fff",
        "font": "18px 'montserratregular', sans-serif",
        "display": "inline-block",
        "marginTop": 0,
        "marginRight": 8,
        "marginBottom": 0,
        "marginLeft": 2
    },
    "curr-job-holder fa": {
        "color": "#fff",
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 2,
        "paddingLeft": 5,
        "borderRadius": 5,
        "background": "#61b3de",
        "cursor": "pointer",
        "fontSize": 0.8,
        "display": "none",
        "marginLeft": 5
    },
    "curr-job-holder:hover fa": {
        "display": "inline-block"
    },
    "proImgHolder": {
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto",
        "border": "5px solid #fff",
        "borderRadius": 11,
        "width": 150,
        "height": 150,
        "position": "relative"
    },
    "proImgHolder imageSelector": {
        "position": "absolute",
        "top": 0,
        "left": 0,
        "width": "100%",
        "height": "100%"
    },
    "proImgHolder img": {
        "width": "100%",
        "height": "100%",
        "display": "block",
        "borderRadius": 5
    },
    "proImgHolder imageSelector a": {
        "display": "block",
        "width": "100%",
        "height": "100%",
        "cursor": "pointer",
        "position": "relative"
    },
    "proImgHolder imageSelector a:hover": {
        "border": "2px dashed #eceef1",
        "background": "rgba(24, 39, 56, 0.3)"
    },
    "proImgHolder imageSelector a:hover:after": {
        "bottom": 4,
        "left": 4
    },
    "proImgHolder imageSelector a:after": {
        "content": "\"\"",
        "display": "block",
        "background": "url(../images/cameraIcon.png) no-repeat 0 0",
        "width": 25,
        "height": 20,
        "position": "absolute",
        "bottom": 6,
        "left": 6
    },
    "cover-image-wrapper imageSelector a:after": {
        "content": "\"\"",
        "display": "block",
        "background": "url(../images/cameraIcon.png) no-repeat 0 0",
        "width": 25,
        "height": 20,
        "position": "absolute",
        "bottom": "auto",
        "left": 10,
        "top": 10
    },
    "cover-image-wrapper imageSelector a:hover:after": {
        "top": 10,
        "left": 10
    },
    "profile-middle-container-left-col": {
        "marginTop": 15,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "profile-middle-container-left-col pg-profile-middle-container-left-col-details": {
        "backgroundColor": "#fff",
        "WebkitBorderRadius": 5,
        "MozBorderRadius": 5,
        "borderRadius": 5,
        "paddingTop": 10,
        "paddingRight": 15,
        "paddingBottom": 10,
        "paddingLeft": 15,
        "boxShadow": "0px 0px 7px -2px #000"
    },
    "newsfeed-middle-container-right-col pg-locked-profile-content": {
        "backgroundColor": "#fff",
        "WebkitBorderRadius": 5,
        "MozBorderRadius": 5,
        "borderRadius": 5,
        "paddingTop": 10,
        "paddingRight": 15,
        "paddingBottom": 10,
        "paddingLeft": 15,
        "boxShadow": "0px 0px 7px -2px #000"
    },
    "profile-content-container": {
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto",
        "width": "98%",
        "maxWidth": 1024
    },
    "pg-body-item": {
        "borderBottom": "1px dashed #e9f0f4",
        "paddingBottom": 10,
        "position": "relative",
        "marginBottom": 15
    },
    "pg-section pg-body-item:last-child": {
        "border": "none"
    },
    "form-holder": {
        "position": "relative"
    },
    "pg-profile-heading": {
        "borderBottom": "1px solid #dee6eb"
    },
    "pg-profile-heading h1": {
        "font": "14px 'montserratregular', sans-serif",
        "color": "#59afe1",
        "marginTop": 2,
        "marginRight": 0,
        "marginBottom": 9,
        "marginLeft": 0
    },
    "pg-section-container pg-section": {
        "paddingTop": 10,
        "paddingBottom": 35,
        "marginBottom": 10,
        "fontSize": 13,
        "lineHeight": 17,
        "color": "#333",
        "fontWeight": "normal"
    },
    "pg-profile-middle-container-left-col-details pg-section-container pg-section": {
        "paddingBottom": 0
    },
    "pg-section-container pg-header": {
        "position": "relative",
        "fontSize": 26,
        "lineHeight": 30,
        "paddingRight": 35,
        "marginBottom": 0
    },
    "profile-content-container locked-screen-holder locked-title": {
        "font": "18px 'montserratregular', sans-serif"
    },
    "locked-screen-holder locked-title fa": {
        "fontSize": 2,
        "color": "#E82107",
        "marginRight": 10
    },
    "pg-section-container pg-header h3": {
        "fontWeight": "lighter",
        "font": "18px 'montserratsemi_bold', sans-serif",
        "fontSize": 18,
        "lineHeight": 18,
        "color": "#2d5164",
        "marginTop": 15,
        "marginRight": 0,
        "marginBottom": 15,
        "marginLeft": 0
    },
    "pg-section pg-edit-tools": {
        "position": "absolute",
        "top": 0,
        "right": 35,
        "filter": "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)",
        "opacity": 0,
        "WebkitTransition": "opacity 0.2s",
        "MozTransition": "opacity 0.2s",
        "OTransition": "opacity 0.2s",
        "transition": "opacity 0.2s"
    },
    "pg-section:hover pg-edit-tools": {
        "filter": "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)",
        "opacity": 1
    },
    "pg-section:focus pg-edit-tools": {
        "filter": "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)",
        "opacity": 1
    },
    "pg-section pg-edit-btn": {
        "fontWeight": "bold",
        "borderWidth": 1,
        "borderStyle": "solid",
        "cursor": "pointer",
        "width": "auto",
        "paddingTop": 1,
        "paddingRight": 10,
        "paddingBottom": 0,
        "paddingLeft": 10,
        "height": 20,
        "lineHeight": 20,
        "WebkitBoxSizing": "border-box",
        "MozBoxSizing": "border-box",
        "boxSizing": "border-box",
        "fontSize": 12,
        "backgroundColor": "#f2f2f2",
        "borderColor": "#a7a7a7",
        "filter": "progid:DXImageTransform.Microsoft.gradient(gradientType=0, startColorstr='#FFF2F2F2', endColorstr='#FFD1D1D1')",
        "display": "inline-block",
        "verticalAlign": "top",
        "zoom": 1,
        "marginLeft": 5,
        "color": "#666",
        "border": 0,
        "textShadow": "none",
        "boxShadow": "none",
        "borderRadius": 0,
        "outline": "none"
    },
    "pg-section pg-edit-add": {
        "fontSize": 12
    },
    "pg-entity-control-field": {
        "position": "relative",
        "display": "table",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pg-field": {
        "position": "relative",
        "display": "table",
        "cursor": "pointer"
    },
    "pg-main-header-field": {
        "font": "12px 'montserratsemi_bold', sans-serif",
        "lineHeight": 12,
        "color": "#61b3de",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pg-entity:hover pg-edit-field-button": {
        "filter": "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)",
        "opacity": 1
    },
    "pg-sub-header-field": {
        "font": "10px 'montserratregular', sans-serif",
        "color": "#a8bfcd",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pg-edit-field-button": {
        "paddingLeft": 0,
        "paddingRight": 0,
        "marginLeft": 8,
        "height": 16,
        "width": 19,
        "lineHeight": 15,
        "border": 0,
        "color": "#505e69",
        "background": "transparent",
        "opacity": 0,
        "WebkitTransition": "opacity 0.2s",
        "MozTransition": "opacity 0.2s",
        "OTransition": "opacity 0.2s",
        "transition": "opacity 0.2s"
    },
    "pg-main-header-field:hover pg-edit-field-button": {
        "filter": "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)",
        "opacity": 1
    },
    "pg-sub-header-field:hover pg-edit-field-button": {
        "filter": "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)",
        "opacity": 1
    },
    "pg-date-area": {
        "font": "10px 'montserratregular', sans-serif",
        "color": "#a8bfcd",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 10,
        "marginLeft": 0
    },
    "pg-description": {
        "font": "11px 'montserratsemi_bold', sans-serif",
        "color": "#2d5164",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 15,
        "marginLeft": 0
    },
    "pg-activities": {
        "font": "11px 'montserratsemi_bold', sans-serif",
        "color": "#2d5164",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pg-date-area:hover pg-edit-field": {
        "filter": "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)",
        "opacity": 1
    },
    "pg-description:hover pg-edit-field": {
        "filter": "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)",
        "opacity": 1
    },
    "pg-activities:hover pg-edit-field": {
        "filter": "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)",
        "opacity": 1
    },
    "pg-edit-field:hover": {
        "color": "#61b3de"
    },
    "buttonaddEduInfo": {
        "textIndent": 0,
        "width": "auto",
        "fontSize": 12,
        "lineHeight": 17,
        "color": "#006fa6",
        "fontWeight": "normal",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "background": "none",
        "border": "none",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "WebkitAppearance": "none",
        "MozAppearance": "none",
        "appearance": "none",
        "display": "block"
    },
    "form-area": {
        "background": "#f4f4f4",
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10,
        "position": "relative",
        "zIndex": 100,
        "width": "100%"
    },
    "yearDropDownHolder": {
        "overflow": "hidden",
        "position": "relative"
    },
    "workPeriodSelect": {
        "display": "inline-block",
        "width": "47%",
        "overflow": "hidden"
    },
    "workPeriodSelectlastDrpDwn": {
        "float": "right"
    },
    "form-area label": {
        "font": "11px 'montserratsemi_bold', sans-serif"
    },
    "datePicker col-xs-5 p": {
        "font": "11px 'montserratsemi_bold', sans-serif"
    },
    "form-area datePicker col-xs-5": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "float": "none",
        "width": "100%"
    },
    "datePicker col-xs-5 pgs-sign-select": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "backgroundColor": "#fff"
    },
    "pg-custom-input": {
        "font": "11px 'montserratsemi_bold', sans-serif",
        "height": 23,
        "paddingTop": 0,
        "paddingRight": 6,
        "paddingBottom": 0,
        "paddingLeft": 6,
        "borderRadius": 0
    },
    "react-autosuggest__container react-autosuggest__input": {
        "font": "11px 'montserratsemi_bold', sans-serif",
        "height": 23,
        "paddingTop": 0,
        "paddingRight": 6,
        "paddingBottom": 0,
        "paddingLeft": 6,
        "borderRadius": 0,
        "width": "70%"
    },
    "pg-dropdown": {
        "width": "48%",
        "display": "inline"
    },
    "workPeriodSelect pg-dropdown": {
        "float": "left"
    },
    "workPeriodSelect pg-dropdown:last-child": {
        "float": "right"
    },
    "form-group spanto": {
        "display": "block",
        "width": 15,
        "lineHeight": 0.6,
        "position": "absolute",
        "top": "25%",
        "left": 0,
        "right": 0,
        "marginTop": "auto",
        "marginRight": "auto",
        "marginBottom": "auto",
        "marginLeft": "auto"
    },
    "display-block": {
        "display": "block"
    },
    "textarea": {
        "resize": "vertical"
    },
    "pg-btn-custom": {
        "paddingTop": 4,
        "paddingRight": 12,
        "paddingBottom": 4,
        "paddingLeft": 12,
        "borderRadius": 0,
        "font": "13px 'montserratregular', sans-serif"
    },
    "intro-wrapper": {
        "marginBottom": 10
    },
    "intro-wrapper add-intro:hover": {
        "color": "#61b3de"
    },
    "intro-wrapper add-intro add-intro-text": {
        "float": "left",
        "cursor": "pointer"
    },
    "intro-wrapper add-intro add-intro-text i": {
        "marginRight": 10
    },
    "intro-form-holder form-group": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "intro-form-holder form-control": {
        "resize": "none",
        "height": 80,
        "textAlign": "center"
    },
    "intro-form-holder form-bottom-holder": {
        "border": "1px solid #dee6eb",
        "borderTop": "none",
        "background": "#eceef1",
        "marginTop": -2,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 7,
        "paddingRight": 10,
        "paddingBottom": 5,
        "paddingLeft": 10,
        "borderRadius": "0 0 5px 5px"
    },
    "intro-form-holder form-bottom-holder char-length-holder": {
        "float": "left"
    },
    "intro-form-holder form-bottom-holder button-holder": {
        "float": "right"
    },
    "form-bottom-holder btn-default": {
        "marginRight": 5
    },
    "form-bottom-holder char-length-holder span": {
        "color": "#a8bfcd",
        "fontSize": 0.8,
        "marginTop": 8,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "display": "block"
    },
    "intro-wrapper intro-holder p": {
        "wordWrap": "break-word"
    },
    "intro-wrapper intro-holder i": {
        "marginLeft": 10,
        "cursor": "pointer"
    },
    "intro-wrapper intro-holder i:hover": {
        "color": "#61b3de"
    },
    "pg-section-container": {
        "borderBottom": "1px solid #dee6eb"
    },
    "pg-edit-skills-btn": {
        "position": "absolute",
        "right": 10,
        "cursor": "pointer",
        "zIndex": 10
    },
    "skills-view-section": {
        "listStyle": "none",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "pg-edit-action-area": {
        "overflow": "hidden"
    },
    "pg-header-sub-title": {
        "font": "14px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 15,
        "marginLeft": 0
    },
    "pg-endrose-item": {
        "font": "10px 'montserratregular', sans-serif",
        "color": "#61b3de",
        "marginTop": 0,
        "marginRight": 5,
        "marginBottom": 5,
        "marginLeft": 0,
        "display": "inline-block",
        "verticalAlign": "middle",
        "background": "#f4f8f8",
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "border": "1px solid #d9e6e6"
    },
    "pg-itel-lbl": {
        "display": "block"
    },
    "skills-form inline-content": {
        "position": "relative"
    },
    "skills-form react-autosuggest__container": {
        "position": "relative",
        "zIndex": 1
    },
    "react-autowhatever-1": {
        "position": "absolute",
        "width": "70%",
        "top": 23,
        "left": 0,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "react-autowhatever-1 li": {
        "listStyleType": "none",
        "paddingTop": 8,
        "paddingRight": 5,
        "paddingBottom": 8,
        "paddingLeft": 5,
        "borderBottom": "1px solid #dee6eb",
        "cursor": "pointer",
        "background": "#fff"
    },
    "react-autowhatever-1 li:hover": {
        "color": "#fff",
        "background": "#61b3de"
    },
    "react-autowhatever-1 react-autosuggest__suggestion--focused": {
        "color": "#fff",
        "background": "#61b3de"
    },
    "react-autowhatever-1 react-autosuggest__suggestion-container": {
        "zIndex": 9999
    },
    "pg-inline-item-btn": {
        "marginLeft": 5,
        "height": 23,
        "paddingTop": 0,
        "paddingRight": 5,
        "paddingBottom": 0,
        "paddingLeft": 5,
        "fontSize": 12
    },
    "skills-edit-section": {
        "listStyle": "none",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "pg-endrose-item-edit": {
        "font": "10px 'montserratregular', sans-serif",
        "color": "#61b3de",
        "marginTop": 0,
        "marginRight": 5,
        "marginBottom": 5,
        "marginLeft": 0,
        "display": "inline-block",
        "verticalAlign": "middle",
        "background": "#f4f8f8",
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "border": "1px solid #d9e6e6"
    },
    "pg-skill-delete-icon": {
        "marginLeft": 10
    },
    "pg-experience-year": {
        "width": "20%",
        "display": "inline"
    },
    "pg-experience-current-option": {
        "marginTop": 1,
        "marginRight": -20,
        "marginBottom": "!important",
        "marginLeft": -20
    },
    "non-resize": {
        "resize": "vertical"
    },
    "pg-dashboard-page": {
        "marginTop": 60,
        "marginRight": 0,
        "marginBottom": 60,
        "marginLeft": 0
    },
    "pg-dashboard-banner-area": {
        "paddingTop": 100
    },
    "pg-dashboard-banner-area-logo-img": {
        "marginBottom": 50
    },
    "pg-dashboard-banner-area-title-wish": {
        "font": "30px 'montserratlight', sans-serif",
        "color": "#2d5164",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "textTransform": "uppercase",
        "textAlign": "center",
        "paddingBottom": 15
    },
    "pg-dashboard-banner-area-title-what-to-do": {
        "font": "44px 'montserratregular', sans-serif",
        "color": "#59afe1",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "textTransform": "uppercase",
        "textAlign": "center"
    },
    "pg-middle-sign-wrapper container-fluid newsCatHolder": {
        "marginTop": 70,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 130,
        "paddingLeft": 0,
        "width": "calc(100% - 220px)"
    },
    "pg-middle-sign-wrapper container-fluid notificationsHolder": {
        "marginTop": 70,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 130,
        "paddingLeft": 0,
        "width": "calc(100% - 220px)"
    },
    "pg-middle-sign-wrapper container-fluid notesCatHolder": {
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 140,
        "marginLeft": "auto",
        "paddingTop": 70,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "width": "calc(100% - 220px)",
        "minHeight": 80 * vh
    },
    "pg-news-page-header": {
        "paddingTop": 11,
        "paddingBottom": 11,
        "backgroundColor": "rgba(7, 7, 7, 0.3)"
    },
    "pg-notes-page-header": {
        "paddingTop": 11,
        "paddingBottom": 11,
        "backgroundColor": "rgba(7, 7, 7, 0.3)",
        "marginBottom": 25
    },
    "pg-news-page-header-title": {
        "font": "20px 'montserratregular', sans-serif",
        "color": "#fff",
        "marginTop": 10,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "textTransform": "uppercase"
    },
    "pg-notes-page-header add-category-btn": {
        "float": "right",
        "width": 150,
        "backgroundImage": "linear-gradient(to bottom, #61b2de 0%, #0272ae 72%)",
        "borderRadius": 4,
        "color": "#fff",
        "display": "block",
        "font": "10px \"montserratsemi_bold\",sans-serif",
        "height": 25,
        "marginTop": 5,
        "marginRight": -10,
        "marginBottom": 0,
        "marginLeft": -10,
        "paddingTop": 6,
        "paddingRight": 0,
        "paddingBottom": 8,
        "paddingLeft": 0,
        "textAlign": "center",
        "textDecoration": "none",
        "textTransform": "uppercase",
        "cursor": "pointer"
    },
    "pg-news-page-content pg-news-page-header": {
        "marginBottom": 25
    },
    "pg-notes-page-content-item note-cat-thumb": {
        "background": "url(../images/pg-notes-view-all.png) #5ebdaa repeat-y -3px top"
    },
    "pg-notes-page-content-item note-cat-thumbmy-notebook": {
        "backgroundColor": "#62b3de !important"
    },
    "shared-user-r-popup": {
        "textAlign": "center"
    },
    "shared-user-r-popup btn-popup": {
        "marginLeft": 5,
        "marginRight": 5,
        "background": "#61b3de",
        "paddingTop": 7,
        "paddingRight": 12,
        "paddingBottom": 7,
        "paddingLeft": 12,
        "textTransform": "uppercase",
        "color": "#fff",
        "borderRadius": 5,
        "fontFamily": "'montserratsemi_bold', sans-serif",
        "fontSize": 0.6,
        "display": "inline-block"
    },
    "shared-user-r-popup btn-popupreject": {
        "background": "#e82107"
    },
    "color-picker": {
        "textAlign": "center",
        "float": "left",
        "marginTop": 30,
        "marginRight": 0,
        "marginBottom": 15,
        "marginLeft": 0,
        "width": "100%"
    },
    "color-picker color": {
        "width": 45,
        "height": 45,
        "border": "2px\tsolid",
        "borderRadius": 5,
        "display": "inline-block",
        "marginRight": 15,
        "cursor": "pointer"
    },
    "color-picker coloractive": {
        "boxShadow": "0px 0px 20px -1px #000"
    },
    "color-picker tone-one": {
        "background": "#5EBDAA"
    },
    "color-picker tone-two": {
        "background": "#F1C058"
    },
    "color-picker tone-three": {
        "background": "#F15858"
    },
    "color-picker tone-four": {
        "background": "#202024"
    },
    "color-picker tone-five": {
        "background": "#8758F1"
    },
    "color-picker tone-six": {
        "background": "#8F7C68"
    },
    "add-note-cat": {
        "float": "right",
        "font": "11px 'montserratsemi_bold', sans-serif",
        "color": "#fff",
        "backgroundColor": "#61b3de",
        "textTransform": "uppercase",
        "border": "none"
    },
    "pg-news-page-add-new-topic-btn": {
        "width": 100,
        "color": "#fff !important",
        "textDecoration": "none !important",
        "float": "right",
        "marginTop": 5,
        "marginRight": -10,
        "marginBottom": 0,
        "marginLeft": -10,
        "backgroundImage": "linear-gradient(to bottom, #61B2DE 0%, #0272AE 72%)",
        "textTransform": "uppercase",
        "font": "10px 'montserratsemi_bold', sans-serif",
        "display": "block",
        "textAlign": "center",
        "paddingTop": 6,
        "paddingRight": 0,
        "paddingBottom": 8,
        "paddingLeft": 0,
        "borderRadius": 4,
        "height": 25
    },
    "pg-news-page-sort-option": {
        "border": "1px solid #59afe1",
        "marginTop": 5,
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "font": "10px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "width": "100%",
        "borderRadius": 4,
        "backgroundImage": "url(../images/select-1.png)",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "90% center",
        "backgroundColor": "#fff",
        "WebkitAppearance": "none",
        "MozAppearance": "none",
        "textIndent": 0.01,
        "textOverflow": "\"\"",
        "outline": "none"
    },
    "pg-news-page-view-type": {
        "border": "1px solid #59afe1",
        "marginTop": 5,
        "marginRight": 10,
        "marginBottom": 5,
        "marginLeft": 0,
        "background": "#fff",
        "borderRadius": 4,
        "display": "inline-block",
        "width": "100%"
    },
    "pg-news-page-view-type-itemactive": {
        "background": "#3c5166",
        "borderRadius": 4
    },
    "pg-news-page-view-type-item": {
        "width": "50%",
        "float": "left"
    },
    "pg-news-page-view-type-item-icon": {
        "display": "block",
        "textAlign": "center",
        "paddingTop": 2,
        "paddingRight": 2,
        "paddingBottom": 2,
        "paddingLeft": 2
    },
    "pg-news-page-seach-bar": {
        "marginTop": 5
    },
    "pg-news-page-seach-bar-input": {
        "border": "1px solid #59afe1",
        "backgroundColor": "#fff",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 7,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "font": "10px 'montserratregular', sans-serif",
        "color": "#9dadbd",
        "width": "100%",
        "borderRadius": 4
    },
    "rm-side-padding": {
        "paddingRight": 0,
        "paddingLeft": 0,
        "float": "right"
    },
    "pg-news-page-content-itemitem1": {
        "background": "#61b3de"
    },
    "pg-news-page-content-itemitem2": {
        "background": "#A3AEEF"
    },
    "pg-news-page-content-itempg-box-shadow": {
        "boxShadow": "0px 1px 5px -1px #000",
        "display": "flex",
        "marginBottom": 40,
        "cursor": "pointer",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "minHeight": 180
    },
    "pg-notes-page-content-itempg-box-shadow": {
        "boxShadow": "0px 1px 5px -1px #000",
        "display": "flex",
        "marginBottom": 40,
        "cursor": "default",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "minHeight": 180
    },
    "pg-news-page-content-itempg-box-shadow pg-news-page-content-item-right-thumbs": {
        "border": "2px solid transparent",
        "borderLeft": "none"
    },
    "pg-news-page-content-itempg-box-shadowselectedbusiness pg-news-page-content-item-right-thumbs": {
        "borderColor": "#96a3ef"
    },
    "pg-news-page-content-itempg-box-shadowselectedtechnology pg-news-page-content-item-right-thumbs": {
        "borderColor": "#c47777"
    },
    "pg-news-page-content-itempg-box-shadowselectedhealth pg-news-page-content-item-right-thumbs": {
        "borderColor": "#92a970"
    },
    "pg-news-page-content-itempg-box-shadowselected": {
        "boxShadow": "0px 1px 10px -1px #000"
    },
    "pg-news-page-content-itempg-box-shadowselected pg-news-page-content-item-right-thumbs": {
        "borderLeft": "none"
    },
    "pg-news-page-content-item-left-thumb": {
        "border": "none",
        "width": "20%",
        "maxWidth": 200,
        "backgroundRepeat": "no-repeat",
        "backgroundSize": "100% 100%",
        "position": "relative",
        "textAlign": "center"
    },
    "pg-news-page-content-item-left-thumb cat-icon-holder": {
        "bottom": 0,
        "height": 70,
        "left": 0,
        "marginTop": "auto",
        "marginRight": "auto",
        "marginBottom": "auto",
        "marginLeft": "auto",
        "position": "absolute",
        "right": 0,
        "top": 0,
        "width": 90
    },
    "pg-notes-page-content-item cat-icon-holder": {
        "bottom": 0,
        "height": 70,
        "left": 0,
        "marginTop": "auto",
        "marginRight": "auto",
        "marginBottom": "auto",
        "marginLeft": "auto",
        "position": "absolute",
        "right": 0,
        "top": 0,
        "width": 90
    },
    "pg-news-page-content-item-left-thumbsaved-articals-holder cat-icon-holder": {
        "height": 40,
        "width": "60%"
    },
    "pg-news-page-content-item-left-thumbthumb-1": {
        "backgroundImage": "url(../images/news-page-item-thumb-1.png)"
    },
    "pg-news-page-content-item-left-thumbbusiness": {
        "backgroundImage": "url(../images/business.png)"
    },
    "pg-news-page-content-item-left-thumbsports": {
        "backgroundImage": "url(../images/sports.png)"
    },
    "pg-news-page-content-item-left-thumbtechnology": {
        "backgroundImage": "url(../images/technology.png)"
    },
    "pg-news-page-content-item-left-thumbhealth": {
        "backgroundImage": "url(../images/health.png)"
    },
    "pg-news-page-content-item-left-thumbentertainment": {
        "backgroundImage": "url(../images/entertainment.png)"
    },
    "pg-news-page-content-item-left-thumbsaved-articals-holder": {
        "backgroundImage": "url(../images/news/saved-articals-bg.png)",
        "minHeight": 170
    },
    "pg-news-page-content-item-left-thumb cat-icon": {
        "display": "block",
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto"
    },
    "pg-notes-page-content-item note-cat-thumb cat-icon": {
        "display": "block",
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto",
        "background": "url(\"../images/notes-cat-icon.png\") no-repeat",
        "width": 50,
        "height": 57
    },
    "pg-news-page-content-item-left-thumbbusiness cat-icon": {
        "background": "url(\"../images/news/business-icon.png\") no-repeat",
        "width": 53,
        "height": 52
    },
    "pg-news-page-content-item-left-thumbtechnology cat-icon": {
        "background": "url(\"../images/news/technology-icon.png\") no-repeat",
        "width": 57,
        "height": 55
    },
    "pg-news-page-content-item-left-thumbhealth cat-icon": {
        "background": "url(\"../images/news/health-icon.png\") no-repeat",
        "width": 41,
        "height": 41
    },
    "pg-notes-page-content-item my-notebook cat-icon-holder": {
        "width": 95,
        "height": 128
    },
    "pg-notes-page-content-item my-notebook cat-icon-holder cat-icon": {
        "background": "url(\"../images/my-notes.png\") no-repeat",
        "width": 80,
        "height": 128
    },
    "pg-notes-page-content-item my-notebook cat-title": {
        "font": "12px 'montserratsemi_bold', sans-serif",
        "color": "#fff",
        "paddingTop": 12,
        "paddingRight": 12,
        "paddingBottom": 12,
        "paddingLeft": 12,
        "border": "1px solid #fff",
        "display": "inline-block",
        "textDecoration": "none",
        "position": "absolute",
        "top": "20%",
        "left": 0,
        "right": 0,
        "marginTop": "auto",
        "marginRight": "auto",
        "marginBottom": "auto",
        "marginLeft": "auto"
    },
    "pg-news-page-content-item-left-thumb cat-title": {
        "font": "1em 'montserratsemi_bold', sans-serif",
        "marginTop": 10,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "color": "#fff"
    },
    "pg-notes-page-content-item note-cat-thumb cat-title": {
        "font": "1em 'montserratsemi_bold', sans-serif",
        "marginTop": 10,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "color": "#fff",
        "textAlign": "center"
    },
    "pg-news-page-content-item-left-thumbsaved-articals-holder cat-title": {
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto",
        "border": "1px solid #fff",
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10,
        "width": "90%"
    },
    "pg-news-page-content-item-right-thumbs": {
        "background": "#F2F6F9",
        "borderLeft": "1px solid #7297aa",
        "paddingTop": 0,
        "paddingRight": 30,
        "paddingBottom": 0,
        "paddingLeft": 30,
        "borderTopRightRadius": 4,
        "borderBottomRightRadius": 4
    },
    "pg-notes-page-content-item-right-thumbs": {
        "background": "#F2F6F9",
        "borderLeft": "1px solid #7297aa",
        "paddingTop": 0,
        "paddingRight": 30,
        "paddingBottom": 0,
        "paddingLeft": 30,
        "borderTopRightRadius": 4,
        "borderBottomRightRadius": 4
    },
    "pg-notes-page-content-item-right-thumbs note-thumb-wrapper": {
        "overflow": "hidden",
        "minHeight": 175
    },
    "pg-col-20": {
        "width": "20%",
        "float": "left",
        "paddingTop": 0,
        "paddingRight": 9,
        "paddingBottom": 0,
        "paddingLeft": 9
    },
    "pg-notes-item-main-row note-holder": {
        "width": "20%",
        "float": "left",
        "paddingTop": 0,
        "paddingRight": 9,
        "paddingBottom": 0,
        "paddingLeft": 9,
        "marginTop": 15,
        "marginRight": 0,
        "marginBottom": 15,
        "marginLeft": 0
    },
    "pg-news-item": {
        "marginTop": 15,
        "marginRight": 0,
        "marginBottom": 15,
        "marginLeft": 0,
        "maxWidth": 120,
        "width": 120
    },
    "add-chanel-wrapperpg-news-item": {
        "background": "#e2ebf1",
        "minHeight": 145,
        "border": "1px dashed #b4c5d0",
        "borderRadius": 4,
        "textAlign": "center",
        "float": "left",
        "marginRight": 10
    },
    "add-chanel-wrapperpg-news-item p": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#2d5164",
        "marginTop": 2,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "add-chanel-wrapperpg-news-item fa": {
        "color": "#2d5164",
        "paddingTop": "44%",
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "pg-notes-item-main-row note": {
        "height": 145,
        "position": "relative",
        "borderRadius": 5,
        "background": "#fff",
        "border": "1px solid #e3e7ea",
        "cursor": "pointer"
    },
    "pg-notes-item-main-row note a": {
        "display": "block",
        "width": "100%",
        "height": "100%"
    },
    "pg-notes-item-main-row note time-wrapper": {
        "paddingTop": 5,
        "paddingRight": 12,
        "paddingBottom": 5,
        "paddingLeft": 12,
        "borderBottom": "1px solid #e3e7ea"
    },
    "pg-notes-item-main-row time-wrapper p": {
        "color": "#61b3de",
        "font": "9px \"montserratsemi_bold\",sans-serif",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 2,
        "marginLeft": 0
    },
    "pg-notes-item-main-row note note-title-holder": {
        "paddingTop": 10,
        "paddingRight": 12,
        "paddingBottom": 10,
        "paddingLeft": 12
    },
    "pg-notes-item-main-row note-title-holder note-title": {
        "color": "#2d5164",
        "font": "13px \"montserratsemi_bold\",sans-serif",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "pg-notes-item-main-row add-new-note": {
        "background": "#e2ebf1",
        "border": "1px dashed #b4c5d0"
    },
    "pg-notes-item-main-row add-new-note add-note-text": {
        "position": "absolute",
        "top": 20,
        "left": 0,
        "bottom": 0,
        "textAlign": "center",
        "right": 0,
        "marginTop": "auto",
        "marginRight": "auto",
        "marginBottom": "auto",
        "marginLeft": "auto",
        "width": "100%",
        "height": 25,
        "color": "#2d5164",
        "font": "10px \"montserratsemi_bold\",sans-serif"
    },
    "pg-notes-item-main-row add-new-note add-note-text:before": {
        "content": "\"\"",
        "display": "block",
        "width": 8,
        "height": 8,
        "position": "absolute",
        "top": -40,
        "left": 0,
        "bottom": 0,
        "right": 0,
        "marginTop": "auto",
        "marginRight": "auto",
        "marginBottom": "auto",
        "marginLeft": "auto",
        "background": "url(../images/add.png) no-repeat 0 0"
    },
    "pg-notes-item-main-row note-holder note-delete-btn": {
        "content": "\"\"",
        "display": "none",
        "width": 25,
        "height": 23,
        "position": "absolute",
        "top": -8,
        "right": -13,
        "background": "url(../images/del-note-icon.png) no-repeat 0 0"
    },
    "pg-news-item-top-row": {
        "display": "inline-block"
    },
    "pg-news-inner-full": {
        "background": "#fff",
        "border": "none",
        "borderRadius": 4,
        "position": "relative"
    },
    "various": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#61b3de",
        "marginTop": 0,
        "marginRight": "!important",
        "marginBottom": 0,
        "marginLeft": "!important",
        "float": "none !important",
        "cursor": "pointer",
        "position": "relative"
    },
    "pg-news-inner-full delete-icon": {
        "width": 18,
        "height": 18,
        "cursor": "pointer",
        "textAlign": "center",
        "position": "absolute",
        "top": -7,
        "right": -7,
        "border": "2px solid #e82107",
        "borderRadius": 999,
        "background": "#fff",
        "display": "none"
    },
    "pg-news-inner-full:hover delete-icon": {
        "display": "block"
    },
    "pg-news-inner-full delete-icon fa": {
        "color": "#e82107",
        "lineHeight": 1.2,
        "fontSize": 1.2
    },
    "pg-pg-news-inner-time": {
        "position": "absolute",
        "top": 10,
        "right": 10,
        "font": "9px 'montserratsemi_bold', sans-serif",
        "color": "#fff",
        "background": "#61b3de",
        "paddingTop": 2,
        "paddingRight": 5,
        "paddingBottom": 2,
        "paddingLeft": 5,
        "borderRadius": 4,
        "zIndex": 500
    },
    "pg-pg-news-inner-img": {
        "width": "100%",
        "height": "100%"
    },
    "pg-news-inner-box-content": {
        "position": "absolute",
        "bottom": 0,
        "zIndex": 3,
        "background": "rgba(0, 0, 0, 0.5)",
        "width": "100%",
        "borderBottomLeftRadius": 3,
        "borderBottomRightRadius": 3
    },
    "pg-news-inner-full artical-heading-holder": {
        "width": "100%",
        "overflow": "hidden !important",
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10,
        "background": "#232d38"
    },
    "pg-news-inner-full artical-name": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "maxWidth": 150,
        "overflow": "hidden !important",
        "textOverflow": "ellipsis",
        "whiteSpace": "nowrap",
        "color": "#fff"
    },
    "pg-news-inner-box-content-txt": {
        "font": "12px 'montserratregular', sans-serif",
        "color": "#fff",
        "marginTop": 10,
        "marginRight": 0,
        "marginBottom": 10,
        "marginLeft": 0,
        "textAlign": "center"
    },
    "pg-news-inner-full:hover pg-news-inner-box-content": {
        "background": "#61b3de"
    },
    "pg-news-inner-full:hover": {
        "boxShadow": "0px 2px 7px 0px #000"
    },
    "pg-notes-item-main-row note-holder note:hover": {
        "boxShadow": "0px 2px 7px 0px #000"
    },
    "pg-notes-item-main-row note:hover note-delete-btn": {
        "display": "block"
    },
    "pg-see-all-click": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#61b3de",
        "marginTop": 8,
        "marginRight": 15,
        "marginBottom": 12,
        "marginLeft": 15,
        "float": "right",
        "cursor": "pointer"
    },
    "pg-see-all-click:hover": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#61b3de",
        "marginTop": 8,
        "marginRight": 15,
        "marginBottom": 12,
        "marginLeft": 15,
        "float": "right",
        "cursor": "pointer"
    },
    "pg-see-all-click:active": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#61b3de",
        "marginTop": 8,
        "marginRight": 15,
        "marginBottom": 12,
        "marginLeft": 15,
        "float": "right",
        "cursor": "pointer"
    },
    "pg-see-all-click:focus": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#61b3de",
        "marginTop": 8,
        "marginRight": 15,
        "marginBottom": 12,
        "marginLeft": 15,
        "float": "right",
        "cursor": "pointer"
    },
    "pg-see-less-click": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#61b3de",
        "marginTop": 8,
        "marginRight": 15,
        "marginBottom": 12,
        "marginLeft": 15,
        "float": "right",
        "cursor": "pointer",
        "display": "none"
    },
    "pg-see-less-click:hover": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#61b3de",
        "marginTop": 8,
        "marginRight": 15,
        "marginBottom": 12,
        "marginLeft": 15,
        "float": "right",
        "cursor": "pointer"
    },
    "pg-see-less-click:active": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#61b3de",
        "marginTop": 8,
        "marginRight": 15,
        "marginBottom": 12,
        "marginLeft": 15,
        "float": "right",
        "cursor": "pointer"
    },
    "pg-see-less-click:focus": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#61b3de",
        "marginTop": 8,
        "marginRight": 15,
        "marginBottom": 12,
        "marginLeft": 15,
        "float": "right",
        "cursor": "pointer"
    },
    "show-more-btn": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#61b3de",
        "marginTop": 8,
        "marginRight": 15,
        "marginBottom": 12,
        "marginLeft": 15,
        "float": "right",
        "cursor": "pointer"
    },
    "pg-news-item-other-row": {
        "display": "none"
    },
    "pg-news-item-main-row": {
        "transition": "all 0.5s",
        "overflow": "hidden"
    },
    "pg-news-item-main-row more-articals": {
        "overflow": "hidden"
    },
    "pg-news-item-main-row articals": {
        "overflow": "hidden"
    },
    "pg-news-item-main-row hiddenBlock": {
        "position": "relative",
        "width": "100%",
        "overflow": "hidden"
    },
    "slideInDown": {
        "WebkitAnimationName": "slideInDown",
        "animationName": "slideInDown"
    },
    "animated": {
        "WebkitAnimationDuration": "1s",
        "animationDuration": "1s",
        "WebkitAnimationFillMode": "both",
        "animationFillMode": "both"
    },
    "pg-news-add-full": {
        "background": "#e2ebf1",
        "border": "1px dashed #b4c5d0",
        "cursor": "pointer"
    },
    "pg-news-add-wrapper": {
        "position": "absolute",
        "width": "100%"
    },
    "pg-news-add-channel-txt": {
        "font": "10px 'montserratsemi_bold', sans-serif",
        "color": "#2d5164",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "textAlign": "center",
        "paddingTop": 50,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "position": "relative"
    },
    "pg-modal-dialog": {
        "height": "90%",
        "overflowX": "hidden"
    },
    "pg-modal-header": {
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10,
        "background": "url('../images/pop-up-back.png') center center no-repeat",
        "backgroundSize": "cover",
        "borderTopRightRadius": 6,
        "borderTopLeftRadius": 6
    },
    "pg-modal-header-title": {
        "font": "14px 'montserratsemi_bold', sans-serif",
        "color": "#2d5164",
        "marginTop": 9,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "textAlign": "center"
    },
    "btn-transparent": {
        "backgroundColor": "transparent !important",
        "borderColor": "transparent !important",
        "outline": "none",
        "border": "none"
    },
    "pg-btn-close": {
        "paddingTop": 4,
        "paddingRight": 4,
        "paddingBottom": 4,
        "paddingLeft": 4,
        "display": "block",
        "fontSize": 20,
        "color": "#2d5164",
        "marginLeft": 8
    },
    "pg-modal-body": {
        "position": "relative",
        "paddingTop": 0,
        "paddingRight": 10,
        "paddingBottom": 0,
        "paddingLeft": 10
    },
    "pg-main-pop-img": {
        "marginBottom": 28,
        "width": "100%",
        "height": "auto"
    },
    "pg-new-news-popup-inner-container": {
        "paddingTop": 0,
        "paddingRight": 20,
        "paddingBottom": 0,
        "paddingLeft": 20
    },
    "pg-body-heading-title": {
        "font": "20px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "paddingBottom": 15
    },
    "pg-social-media": {
        "marginBottom": 28
    },
    "pg-new-news-popup-inner-border": {
        "borderTop": "1px solid #d6e1ea",
        "paddingTop": 1,
        "marginBottom": 20
    },
    "pg-news-popup-body-txt": {
        "font": "12px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 15,
        "marginLeft": 0
    },
    "jspVerticalBar": {
        "right": 2,
        "width": 4
    },
    "jspTrack": {
        "background": "white !important"
    },
    "loadFacebookG": {
        "width": 58,
        "height": 58,
        "display": "block",
        "position": "relative",
        "marginTop": "auto",
        "marginRight": "auto",
        "marginBottom": "auto",
        "marginLeft": "auto"
    },
    "facebook_blockG": {
        "backgroundColor": "rgb(236,238,241)",
        "border": "1px solid rgb(89,175,225)",
        "float": "left",
        "height": 30,
        "marginLeft": 3,
        "width": 8,
        "opacity": 0.1,
        "animationName": "bounceG",
        "OAnimationName": "bounceG",
        "MsAnimationName": "bounceG",
        "WebkitAnimationName": "bounceG",
        "MozAnimationName": "bounceG",
        "animationDuration": "1.5s",
        "OAnimationDuration": "1.5s",
        "MsAnimationDuration": "1.5s",
        "WebkitAnimationDuration": "1.5s",
        "MozAnimationDuration": "1.5s",
        "animationIterationCount": "infinite",
        "OAnimationIterationCount": "infinite",
        "MsAnimationIterationCount": "infinite",
        "WebkitAnimationIterationCount": "infinite",
        "MozAnimationIterationCount": "infinite",
        "animationDirection": "normal",
        "OAnimationDirection": "normal",
        "MsAnimationDirection": "normal",
        "WebkitAnimationDirection": "normal",
        "MozAnimationDirection": "normal",
        "transform": "scale(0.7)",
        "OTransform": "scale(0.7)",
        "MsTransform": "scale(0.7)",
        "WebkitTransform": "scale(0.7)",
        "MozTransform": "scale(0.7)"
    },
    "blockG_1": {
        "animationDelay": "0.45s",
        "OAnimationDelay": "0.45s",
        "MsAnimationDelay": "0.45s",
        "WebkitAnimationDelay": "0.45s",
        "MozAnimationDelay": "0.45s"
    },
    "blockG_2": {
        "animationDelay": "0.6s",
        "OAnimationDelay": "0.6s",
        "MsAnimationDelay": "0.6s",
        "WebkitAnimationDelay": "0.6s",
        "MozAnimationDelay": "0.6s"
    },
    "blockG_3": {
        "animationDelay": "0.75s",
        "OAnimationDelay": "0.75s",
        "MsAnimationDelay": "0.75s",
        "WebkitAnimationDelay": "0.75s",
        "MozAnimationDelay": "0.75s"
    },
    "pg-middle-chat-screen-area": {
        "marginTop": 70,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "width": "calc(100% - 220px)",
        "minHeight": 80 * vh
    },
    "pg-middle-chat-content-header": {
        "backgroundColor": "rgba(7, 7, 8, 0.3)",
        "paddingBottom": 15,
        "paddingTop": 15
    },
    "q-chat": {
        "border": "1px solid #c7c1b7",
        "borderRadius": "4px 4px 0px 0px"
    },
    "pg-middle-chat-content-header h2": {
        "color": "#fff",
        "font": "20px \"montserratregular\",sans-serif",
        "marginTop": 4,
        "marginRight": 0,
        "marginBottom": 4,
        "marginLeft": 0,
        "textTransform": "uppercase"
    },
    "pg-middle-chat-screen-area container": {
        "width": "100%",
        "paddingTop": 0
    },
    "pg-middle-chat-screen-area chat-window": {
        "background": "#fff"
    },
    "chat-windowcontainer": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "chat-window header": {
        "position": "relative",
        "paddingTop": 10,
        "paddingRight": 0,
        "paddingBottom": 10,
        "paddingLeft": 0,
        "boxShadow": "0px 2px 3px -3px #000",
        "zIndex": 1
    },
    "chat-inbox-options": {
        "marginTop": 2
    },
    "chat-window chat-inbox-options > div": {
        "display": "inline-block",
        "marginRight": 15,
        "cursor": "pointer"
    },
    "chat-window chat-inbox-options > div:last-child": {
        "marginRight": 0
    },
    "chat-inbox-options > div p": {
        "font": "0.75em \"montserratregular\", sans-serif",
        "textTransform": "uppercase",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "lineHeight": 1,
        "color": "#7795a8"
    },
    "chat-inbox-options > div:hover p": {
        "color": "#61b3de"
    },
    "chat-inbox-options total": {
        "color": "#fff",
        "paddingTop": 2,
        "paddingRight": 5,
        "paddingBottom": 2,
        "paddingLeft": 5,
        "background": "#9da8b2",
        "borderRadius": 5,
        "marginLeft": 10,
        "fontSize": 0.7,
        "lineHeight": 1,
        "float": "right"
    },
    "chat-inbox-options > div:hover total": {
        "background": "#61b3de"
    },
    "chat-person-options": {
        "borderLeft": "1px solid #dee6eb"
    },
    "chat-person-options searching-notifi": {
        "borderBottom": "1px solid #59afe1",
        "background": "#e2f4ff",
        "paddingTop": 3,
        "paddingRight": 5,
        "paddingBottom": 3,
        "paddingLeft": 5,
        "position": "absolute",
        "bottom": -34,
        "left": 0,
        "width": "100%",
        "textAlign": "center"
    },
    "chat-person-options searching-notifi p": {
        "color": "#61b3de",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "fontSize": 0.8
    },
    "chat-person-options connection-name": {
        "float": "left"
    },
    "chat-person-options react-autosuggest__container": {
        "float": "left",
        "width": "60%",
        "position": "relative"
    },
    "chat-person-options react-autosuggest__container  react-autowhatever-1": {
        "top": 24
    },
    "chat-person-options connection-name p": {
        "font": "0.9em 'montserratsemi_bold', sans-serif",
        "color": "#2d5164",
        "lineHeight": 1,
        "marginTop": 6,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "media-options-holder": {
        "float": "right"
    },
    "media-options-holder media-options": {
        "float": "left",
        "overflow": "hidden",
        "border": "1px solid #59afe1",
        "borderRadius": 5,
        "marginTop": 0,
        "marginRight": 15,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "media-options-holder media-optionshasSearch": {
        "width": "64%",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": "13%"
    },
    "media-options-holder media-options opt": {
        "float": "left",
        "paddingTop": 2,
        "paddingRight": 7,
        "paddingBottom": 2,
        "paddingLeft": 7,
        "borderRight": "1px solid #59afe1",
        "textAlign": "center",
        "color": "#9dadbd",
        "cursor": "pointer"
    },
    "media-options-holder media-options msg-search-holder": {
        "float": "left",
        "position": "relative",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "width": "36%"
    },
    "media-options-holder msg-search-holder form-control": {
        "border": "none",
        "borderRadius": 0,
        "height": 24,
        "boxShadow": "none",
        "paddingTop": 11,
        "paddingRight": 25,
        "paddingBottom": 12,
        "paddingLeft": 7,
        "borderRight": "1px solid #59afe1",
        "fontSize": 0.8
    },
    "media-options-holder msg-search-holder fa": {
        "color": "#9dadbd",
        "position": "absolute",
        "top": 4,
        "right": 7,
        "cursor": "pointer"
    },
    "media-options-holder media-options opt:last-child": {
        "border": "none"
    },
    "media-options-holder media-options chat-icon": {
        "paddingTop": 4,
        "paddingRight": 7,
        "paddingBottom": 0,
        "paddingLeft": 7
    },
    "media-options-holder media-options chat-icon i": {
        "width": 17,
        "height": 14,
        "display": "inline-block",
        "background": "url(../images/chat-friend.png) no-repeat 0 0"
    },
    "media-options-holder all-media": {
        "float": "right",
        "width": 100,
        "height": 25,
        "background": "none",
        "borderColor": "#59afe1",
        "overflow": "hidden"
    },
    "media-options-holder all-media btn-text": {
        "font": "0.7em \"montserratregular\", sans-serif",
        "float": "left"
    },
    "media-options-holder all-media fa": {
        "float": "right",
        "color": "#9fafbe"
    },
    "pg-middle-chat-screen-area chat-body": {
        "height": "calc(100vh - 318px)",
        "overflow": "hidden",
        "zIndex": 0
    },
    "chat-body conv-holder": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "borderRight": "1px solid #dee6eb",
        "height": "100%"
    },
    "conv-holder msg-holder": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "overflow": "hidden",
        "position": "relative",
        "cursor": "pointer",
        "borderBottom": "1px solid #dee6eb",
        "height": 62,
        "background": "#f2f6f9"
    },
    "conv-holder msg-holder a": {
        "display": "block",
        "overflow": "hidden",
        "paddingTop": 12,
        "paddingRight": 12,
        "paddingBottom": 12,
        "paddingLeft": 12
    },
    "conv-holder msg-holder:hover a": {
        "paddingLeft": 9,
        "background": "#e2f4ff",
        "borderLeft": "3px solid #61b3de"
    },
    "conv-holder msg-holder-selected a": {
        "paddingLeft": 9,
        "background": "#e2f4ff",
        "borderLeft": "3px solid #61b3de"
    },
    "msg-holder chat-pro-img": {
        "float": "left",
        "marginRight": 10
    },
    "msg-holder chat-body": {
        "float": "left"
    },
    "msg-holder chat-body connection-name": {
        "font": "0.8em \"montserratregular\", sans-serif",
        "color": "#61b3de",
        "display": "block",
        "marginBottom": 2
    },
    "msg-holder chat-body msg": {
        "marginTop": 5,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "0.8em 'montserratsemi_bold', sans-serif"
    },
    "msg-holder chat-body chat-date": {
        "font": "0.6em 'montserratsemi_bold', sans-serif",
        "position": "absolute",
        "right": 10,
        "bottom": 0,
        "color": "#7795a8"
    },
    "msg-holder chat-body type-of-action": {
        "font": "11px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "marginTop": -1,
        "fontSize": 0.7
    },
    "chat-msg-holder": {
        "paddingTop": 30,
        "paddingRight": 30,
        "paddingBottom": 10,
        "paddingLeft": 30
    },
    "chat-msg-holder chat-view": {
        "height": 52 * vh
    },
    "chat-msg-holder chat-view chat-block": {
        "overflow": "hidden",
        "marginBottom": 10,
        "paddingBottom": 18
    },
    "chat-view chat-block img": {
        "float": "left",
        "marginRight": 18
    },
    "chat-view chat-block chat-msg-body": {
        "float": "left",
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10,
        "font": "0.8em \"montserratregular\", sans-serif",
        "position": "relative",
        "maxWidth": "85%",
        "borderRadius": 8
    },
    "chat-view chat-blockreceiver img": {
        "cursor": "pointer"
    },
    "chat-view chat-blockreceiver chat-msg-body": {
        "background": "#ededed"
    },
    "chat-view chat-blockreceiver chat-msg-body:before": {
        "content": "\"\"",
        "width": 15,
        "height": 10,
        "position": "absolute",
        "top": 0,
        "left": -8,
        "background": "url(../images/receiver-chat-arrow.png) no-repeat 0 0"
    },
    "chat-view chat-blocksender chat-msg-body": {
        "background": "#e2f4ff"
    },
    "chat-view chat-blocksender chat-msg-body:after": {
        "content": "\"\"",
        "width": 15,
        "height": 10,
        "position": "absolute",
        "top": 0,
        "right": -10,
        "background": "url(../images/sender-chat-arrow.png) no-repeat 0 0"
    },
    "chat-block chat-msg-body user-name": {
        "display": "block",
        "fontSize": 0.9,
        "cursor": "pointer",
        "color": "#61b3de",
        "marginBottom": 10
    },
    "chat-block chat-msg-body chat-msg": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "chat-block chat-msg-body chat-msg highlighted": {
        "display": "inline-block",
        "background": "#FFF9CA",
        "borderBottom": "1px solid #FFE400"
    },
    "chat-block chat-msg-body chat-msg-time": {
        "position": "absolute",
        "bottom": -15,
        "left": 10,
        "font": "0.6em 'montserratsemi_bold', sans-serif",
        "color": "#bbcad3"
    },
    "chat-blocksender img": {
        "float": "right",
        "marginTop": 0,
        "marginRight": 12,
        "marginBottom": 0,
        "marginLeft": 18
    },
    "chat-blocksender chat-msg-body": {
        "float": "right",
        "textAlign": "right"
    },
    "chat-blocksender chat-msg-body chat-msg-time": {
        "left": "auto",
        "right": 0
    },
    "chat-msg-input-holder": {
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "border": "1px solid #dee6eb",
        "background": "#f2f6f9",
        "overflow": "hidden"
    },
    "chat-msg-input-holder img": {
        "float": "left",
        "marginRight": 10
    },
    "chat-msg-input-holder msg-input": {
        "float": "left",
        "width": "89%"
    },
    "chat-msg-input-holder msg-input form-control": {
        "border": "none",
        "background": "none",
        "color": "#2d5164",
        "boxShadow": "none",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "minHeight": 45,
        "resize": "none"
    },
    "chat-msg-input-holder msg-input form-control:focus": {
        "border": "none",
        "boxShadow": "none"
    },
    "chat-msg-options-holder send-msg": {
        "float": "right",
        "fontFamily": "'montserratsemi_bold', sans-serif",
        "marginTop": 10
    },
    "chat-msg-options-holder send-msg btnsend-btn": {
        "display": "inline-block",
        "background": "#61b3de",
        "border": "none",
        "borderRadius": 5,
        "textTransform": "uppercase",
        "color": "#fff",
        "fontSize": 0.7
    },
    "chat-msg-options-holder send-msg send-msg-helper-text": {
        "marginRight": 15,
        "color": "#7795a8",
        "fontSize": 0.6
    },
    "incomingCall": {
        "textAlign": "center"
    },
    "video-call-view": {
        "position": "absolute",
        "top": 0,
        "left": 0,
        "bottom": 0,
        "right": 0,
        "height": 600,
        "marginTop": "auto",
        "marginRight": "auto",
        "marginBottom": "auto",
        "marginLeft": "auto"
    },
    "answer": {
        "borderRadius": 20
    },
    "reject": {
        "borderRadius": 20
    },
    "inCallPane_inner_div": {
        "backgroundColor": "#514c46",
        "height": "auto",
        "textAlign": "center",
        "paddingTop": 20,
        "paddingRight": 25,
        "paddingBottom": 20,
        "paddingLeft": 25,
        "borderRadius": 10
    },
    "video-call-holder": {
        "minHeight": 510,
        "position": "relative"
    },
    "inCallOther": {
        "fontSize": 18,
        "color": "#c7bfb2"
    },
    "onCall": {
        "fontSize": 18,
        "color": "#fff"
    },
    "top-padding-20": {
        "paddingTop": 20
    },
    "img-custom-medium": {
        "width": 75,
        "height": 75
    },
    "bottom-margin-20": {
        "marginBottom": 20
    },
    "income-call": {
        "marginRight": 20
    },
    "hangup-outer": {
        "position": "absolute",
        "top": -15,
        "right": -18
    },
    "chat-notification-wrapper": {
        "position": "absolute",
        "width": 300,
        "borderRadius": 3,
        "right": -130,
        "top": 55,
        "display": "none",
        "zIndex": 100,
        "cursor": "default"
    },
    "chat-notification-header msg-holder": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "overflow": "hidden",
        "position": "relative",
        "cursor": "pointer",
        "borderBottom": "1px solid #dee6eb",
        "background": "#f2f6f9",
        "height": 70
    },
    "chat-notification-header msg-holderread": {
        "background": "#fff"
    },
    "chat-notification-header msg-holder a": {
        "display": "block",
        "paddingTop": 12,
        "paddingRight": 12,
        "paddingBottom": 12,
        "paddingLeft": 12,
        "overflow": "hidden"
    },
    "chat-notification-header msg-holder a:hover": {
        "background": "#e2f4ff",
        "borderLeft": "3px solid #61b3de",
        "paddingLeft": 9
    },
    "chat-notification-header msg-holder-selected a": {
        "background": "#e2f4ff",
        "borderLeft": "3px solid #61b3de",
        "paddingLeft": 9
    },
    "drop_downarrow": {
        "position": "absolute",
        "top": -7,
        "right": 0,
        "left": 0,
        "marginTop": "auto",
        "marginRight": "auto",
        "marginBottom": "auto",
        "marginLeft": "auto"
    },
    "unread_chat_count_header": {
        "position": "relative",
        "top": -45,
        "left": 30
    },
    "unread_chat_count_header total": {
        "color": "#fff",
        "paddingTop": 2,
        "paddingRight": 5,
        "paddingBottom": 2,
        "paddingLeft": 5,
        "background": "#61b3de",
        "borderRadius": 10,
        "fontSize": 0.7,
        "lineHeight": 1
    },
    "chat-dropdown-holder": {
        "position": "relative"
    },
    "videoContainer": {
        "display": "block",
        "minHeight": 510
    },
    "videoContainer local": {
        "width": "100px !important",
        "left": 6,
        "position": "absolute",
        "bottom": 39,
        "border": "1px solid #fff"
    },
    "videoContainer remote": {
        "width": "100%"
    },
    "inCallPane-wrapper": {
        "position": "fixed",
        "width": "100%",
        "zIndex": 1000,
        "height": "100%",
        "left": 0,
        "top": 0,
        "backgroundColor": "rgba(0, 0, 0, 0.6)"
    },
    "chat-notification-header msg-holder chat-body msg": {},
    "connection-list": {
        "float": "left",
        "minWidth": 100,
        "height": 25,
        "background": "none",
        "borderColor": "#59afe1",
        "overflow": "hidden",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "connection-list pgs-sign-select": {
        "width": "100%",
        "WebkitAppearance": "none",
        "MozAppearance": "none",
        "background": "url(../images/select-arrow.png) no-repeat 92% center",
        "font": "12px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "border": "none",
        "WebkitBorderRadius": 3,
        "MozBorderRadius": 3,
        "paddingTop": 5,
        "paddingRight": 10,
        "paddingBottom": 5,
        "paddingLeft": 10
    },
    "media-options-holder media-options new-message a": {
        "paddingTop": 2,
        "textDecoration": "none"
    },
    "chat-pro-img img": {
        "width": 40,
        "height": 40
    },
    "clock": {
        "color": "#c7bfb2",
        "display": "none"
    },
    "pg-middle-content-top-middle-secretary pgs-secratery-img": {
        "float": "none",
        "marginTop": 20,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto",
        "width": 95,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "pg-middle-content-top-middle-secretary pgs-secratery-img img": {
        "borderRadius": 5
    },
    "notificationsHolder middle-info-holder": {
        "textAlign": "center",
        "marginTop": 20,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "notificationsHolder middle-info-holder users-time": {
        "color": "#2d5164",
        "font": "25px \"montserratlight\",sans-serif",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 5,
        "marginLeft": 0
    },
    "notificationsHolder middle-info-holder user-date": {
        "color": "#2d5164",
        "font": "25px \"montserratlight\",sans-serif",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 10,
        "marginLeft": 0,
        "fontSize": 1.1,
        "textTransform": "uppercase"
    },
    "notificationsHolder middle-info-holder greeting-and-notifi": {
        "color": "#59afe1",
        "font": "25px \"montserratlight\",sans-serif",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "notificationsHolder notification-box-holder": {
        "marginTop": 15,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "notification-box notifi-inner-wrapper": {
        "boxShadow": "0 0 4px -2px #020202"
    },
    "notifi-inner-wrapper box-header-wrapper": {
        "background": "#fff",
        "borderBottom": "1px solid #dee6eb",
        "borderTopLeftRadius": 5,
        "borderTopRightRadius": 5,
        "paddingTop": 12,
        "paddingRight": 0,
        "paddingBottom": 12,
        "paddingLeft": 0
    },
    "notifi-inner-wrapper pg-secratery-chat-box-see-all": {
        "backgroundColor": "#fff",
        "borderBottomLeftRadius": 5,
        "borderBottomRightRadius": 5,
        "paddingTop": 12,
        "paddingRight": 0,
        "paddingBottom": 5,
        "paddingLeft": 0,
        "borderTop": "1px solid #dee6eb"
    },
    "pg-secratery-chat-box-see-all p": {
        "color": "#61b3de",
        "display": "block",
        "font": "1em \"montserratregular\",sans-serif",
        "textAlign": "center",
        "textDecoration": "none",
        "cursor": "pointer"
    },
    "box-header-wrapper box-title": {
        "color": "#2d5164",
        "font": "14px \"montserratsemi_bold\",sans-serif",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "box-header-wrapper label": {
        "font": "10px \"montserratregular\",sans-serif",
        "color": "#7795a8",
        "cursor": "pointer",
        "display": "inline-block",
        "marginTop": -4,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 5,
        "textTransform": "capitalize",
        "verticalAlign": "middle"
    },
    "box-header-wrapper notifi-sub-link": {
        "font": "10px \"montserratregular\",sans-serif",
        "color": "#7795a8",
        "cursor": "pointer",
        "display": "inline-block",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "textTransform": "capitalize",
        "verticalAlign": "top",
        "float": "right",
        "width": "100%"
    },
    "box-header-wrapper pg-top-mark-setings input": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 5
    },
    "box-header-wrapper notifi-sub-link fa": {
        "marginRight": 5
    },
    "NotificationList msg-holder": {
        "height": "auto",
        "minHeight": 70
    },
    "notifi-inner-wrapper box-header-wrapper pg-top-mark-setings": {
        "textAlign": "right"
    },
    "notifi-inner-wrapper notification-body": {
        "float": "left",
        "width": "80%"
    },
    "notifi-inner-wrapper btn-default": {
        "background": "#61b3de",
        "paddingTop": 7,
        "paddingRight": 12,
        "paddingBottom": 7,
        "paddingLeft": 12,
        "textTransform": "uppercase",
        "color": "#fff",
        "borderRadius": 5,
        "fontFamily": "'montserratsemi_bold', sans-serif",
        "fontSize": 0.6,
        "display": "inline-block"
    },
    "notifi-inner-wrapper btn-defaultreject": {
        "background": "#e82107"
    },
    "notifi-inner-wrapper notification-body connection-name": {
        "font": "0.8em \"montserratregular\", sans-serif",
        "color": "#61b3de",
        "display": "block",
        "marginBottom": 2
    },
    "notifi-inner-wrapper notification-body extra-cont": {
        "font": "0.8em \"montserratregular\", sans-serif",
        "color": "#61b3de",
        "display": "block",
        "marginBottom": 2
    },
    "notifi-inner-wrapper notification-body msg": {
        "marginTop": 5,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "0.8em 'montserratsemi_bold', sans-serif"
    },
    "notifi-inner-wrapper notification-body chat-date": {
        "font": "0.6em 'montserratsemi_bold', sans-serif",
        "position": "absolute",
        "right": 10,
        "bottom": 0,
        "color": "#7795a8"
    },
    "notifi-inner-wrapper notification-body type-of-action": {
        "font": "11px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "marginTop": -1,
        "fontSize": 0.7
    },
    "bubble-holder": {
        "position": "fixed",
        "bottom": 110,
        "left": 110,
        "zIndex": 2
    },
    "chat-popup": {
        "width": 250,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 15,
        "height": 282,
        "background": "#fff",
        "boxShadow": "0 0 50px -20px #000"
    },
    "chat-popuppopup-minimized": {
        "height": 45,
        "marginTop": 235
    },
    "chat-popup header-wrapper": {
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10,
        "position": "relative",
        "borderBottom": "1px solid #dee6eb"
    },
    "chat-popuppopup-minimized header-wrapper call-opts-wrapper": {
        "display": "none"
    },
    "chat-popup header-wrapper connection-name": {
        "cursor": "pointer"
    },
    "header-wrapper bubble-opts-holder": {
        "position": "absolute",
        "top": 3,
        "right": 4
    },
    "header-wrapper bubble-opts-holder opt-icon": {
        "marginRight": 10,
        "cursor": "pointer"
    },
    "bubble-opts-holder close": {
        "fontSize": 1
    },
    "chat-popup header-wrapper chat-pro-img": {
        "float": "left",
        "marginRight": 10
    },
    "header-wrapper chat-pro-img img": {
        "width": 22,
        "height": 22
    },
    "header-wrapper connection-name": {
        "fontFamily": "'montserratsemi_bold', sans-serif",
        "textTransform": "capitalize",
        "color": "#2d5164",
        "fontSize": 1,
        "float": "left",
        "marginTop": 5,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "header-wrapper icon": {
        "color": "#a8bfcd"
    },
    "header-wrapper iconclose": {
        "opacity": 1
    },
    "header-wrapper call-opts-wrapper": {
        "marginTop": 10,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "header-wrapper call-opts-wrapper chat-opts": {
        "float": "left"
    },
    "header-wrapper call-opts-wrapper icon": {
        "marginRight": 10,
        "cursor": "pointer"
    },
    "call-opts-wrapper icon:last-child": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "call-opts-wrapper all-media": {
        "float": "right",
        "cursor": "pointer",
        "color": "#61b3de",
        "fontSize": 0.714,
        "marginTop": 5,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "textTransform": "uppercase"
    },
    "chat-popup chat-block": {
        "overflow": "hidden",
        "marginBottom": 10,
        "paddingBottom": 18,
        "width": "100%"
    },
    "chat-popup chat-view": {
        "background": "#f2f6f9",
        "height": 170
    },
    "chat-popup chat-view sender": {
        "float": "right",
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5
    },
    "chat-popup chat-view receiver": {
        "float": "left",
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5
    },
    "chat-popup chatMsg": {
        "borderTop": "1px solid #dee6eb",
        "position": "relative"
    },
    "chat-popup chatMsg chat-msg-input-holder": {
        "width": "75%",
        "float": "left",
        "border": "none",
        "background": "none",
        "overflow": "visible"
    },
    "chat-popup chatMsg chat-msg-input-holder msg-input": {
        "width": "100%",
        "float": "none"
    },
    "chat-popup chatMsg form-validation-alert": {
        "position": "absolute",
        "top": -15,
        "left": 5
    },
    "chat-popup chatMsg chat-msg-input-holder form-control": {
        "height": 25,
        "minHeight": 0
    },
    "chat-popup chatMsg chat-msg-options-holder": {
        "float": "right"
    },
    "chat-popup chatMsg send-msg": {
        "marginTop": 7,
        "marginRight": 5,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "notification-header": {
        "position": "relative"
    },
    "notification-header btn-default": {
        "background": "#61b3de",
        "paddingTop": 10,
        "paddingRight": 15,
        "paddingBottom": 10,
        "paddingLeft": 15,
        "textTransform": "uppercase",
        "color": "#fff",
        "borderRadius": 5,
        "fontFamily": "'montserratsemi_bold', sans-serif",
        "fontSize": 0.714,
        "position": "absolute",
        "top": 20,
        "left": 0
    },
    "notificationspopover-holder": {
        "maxWidth": 366,
        "width": 366,
        "marginLeft": "9%"
    },
    "popoverright>arrow": {
        "top": "90px!important"
    },
    "notificationspopover-holder arrow": {
        "left": "10% !important"
    },
    "popover-holder inner-wrapper": {
        "paddingTop": 30,
        "paddingRight": 32,
        "paddingBottom": 30,
        "paddingLeft": 32
    },
    "notificationspopover-holder popover-content": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "notifications popover-content option-block": {
        "paddingTop": 10,
        "paddingRight": 15,
        "paddingBottom": 10,
        "paddingLeft": 15,
        "border": "1px solid #d7e2ea",
        "marginBottom": 10,
        "borderRadius": 5,
        "position": "relative"
    },
    "notifications popover-content option-blockactive": {
        "borderColor": "#61b3de",
        "WebkitBoxShadow": "0px 2px 18px -2px rgba(0,0,0,0.75)",
        "MozBoxShadow": "0px 2px 18px -2px rgba(0,0,0,0.75)",
        "boxShadow": "0px 2px 18px -2px rgba(0,0,0,0.75)"
    },
    "notifications popover-content custom-block": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "notifications custom-block custom-header": {
        "paddingTop": 10,
        "paddingRight": 15,
        "paddingBottom": 10,
        "paddingLeft": 15,
        "borderBottom": "1px solid #dee6eb"
    },
    "notifications custom-block time-holder": {
        "background": "#f2f6f9",
        "paddingTop": 15,
        "paddingRight": 0,
        "paddingBottom": 15,
        "paddingLeft": 0,
        "textAlign": "center",
        "display": "none"
    },
    "notifications option-blockactive time-holder": {
        "display": "block"
    },
    "custom-block time-holder field-holder": {
        "display": "inline-block"
    },
    "custom-block time-holder day-period": {
        "marginLeft": 10
    },
    "custom-block time-holder field-holder:first-child:after": {
        "content": "\":\"",
        "display": "inline-block",
        "marginTop": 0,
        "marginRight": 10,
        "marginBottom": 0,
        "marginLeft": 10,
        "color": "#7795a8"
    },
    "custom-block time-holder field-holder input": {
        "textAlign": "center",
        "borderRadius": 5,
        "borderColor": "#d6e1ea",
        "paddingTop": 8,
        "paddingRight": 10,
        "paddingBottom": 8,
        "paddingLeft": 10,
        "background": "#fff",
        "textTransform": "uppercase",
        "boxShadow": "none",
        "display": "inline-block",
        "width": 70,
        "fontSize": 0.85
    },
    "popover-content number-block form-control": {
        "border": "none",
        "boxShadow": "none",
        "color": "#2d5164",
        "fontSize": 0.857
    },
    "popover-content number-block form-control:focus": {
        "border": "none",
        "boxShadow": "none",
        "color": "#2d5164",
        "fontSize": 0.857
    },
    "popover-content number-block fa": {
        "position": "absolute",
        "top": 20,
        "right": 22
    },
    "popover-content option-block input[type=\"checkbox\"]": {
        "display": "none"
    },
    "popover-content option-block label": {
        "position": "relative",
        "paddingLeft": 38,
        "textTransform": "capitalize",
        "fontSize": 1,
        "color": "#2d5164",
        "cursor": "pointer",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "lineHeight": 1.7
    },
    "popover-content option-block label:before": {
        "content": "\"\"",
        "position": "absolute",
        "top": 0,
        "left": 0,
        "width": 22,
        "height": 22,
        "border": "2px solid #dee6eb",
        "borderRadius": 5
    },
    "popover-content option-block input[type=\"checkbox\"]:checked + label:before": {
        "content": "\"\\f00c\"",
        "fontFamily": "'fontAwesome'",
        "width": 22,
        "height": 22,
        "textAlign": "center",
        "background": "#61b3de",
        "borderRadius": 5,
        "border": "none",
        "lineHeight": 1.6,
        "color": "#fff"
    },
    "popover-content save-btn": {
        "float": "right",
        "background": "#61b3de",
        "textTransform": "uppercase",
        "color": "#fff",
        "paddingTop": 12,
        "paddingRight": 44,
        "paddingBottom": 12,
        "paddingLeft": 44,
        "fontSize": 0.929,
        "lineHeight": 1,
        "marginTop": 10
    },
    "share-icon": {
        "position": "absolute",
        "bottom": 10,
        "right": 10,
        "cursor": "pointer"
    },
    "share-icon fa": {
        "color": "#fff"
    },
    "popup-holder": {
        "marginLeft": "20px !important",
        "maxWidth": 500,
        "width": 500,
        "background": "#e8eef2",
        "borderRadius": 5
    },
    "popup-holderadd-new": {
        "marginTop": "20px !important",
        "marginLeft": "0 !important",
        "maxWidth": 340,
        "width": 340
    },
    "popup-holderright arrow:after": {
        "borderRightColor": "#e8eef2"
    },
    "popup-holderbottom arrow:after": {
        "borderBottomColor": "#e8eef2",
        "borderRightColor": "transparent"
    },
    "popup-holder popover-content": {
        "background": "#e8eef2",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "popup-holder popover-content share-popup-holder": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "popup-holder header-holder": {
        "paddingTop": 10,
        "paddingRight": 20,
        "paddingBottom": 10,
        "paddingLeft": 20
    },
    "popup-holder header-holder title": {
        "fontSize": 1.143,
        "marginTop": 7,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 50,
        "float": "left",
        "color": "#2d5164",
        "fontWeight": 600
    },
    "popup-holder header-holder form-group": {
        "width": 160,
        "height": 25,
        "float": "right"
    },
    "popup-holder header-holder form-group input": {
        "height": 30
    },
    "popup-holderadd-new header-holder form-group": {
        "marginTop": 5,
        "float": "left"
    },
    "popup-holder popup-body-holder shared-users-container": {
        "maxHeight": 135,
        "overflow": "hidden"
    },
    "popup-holder popup-body-holder user-block": {
        "paddingTop": 12,
        "paddingRight": 23,
        "paddingBottom": 12,
        "paddingLeft": 23,
        "position": "relative"
    },
    "popup-holder popup-body-holder user-blockshared separator": {
        "position": "absolute",
        "top": 0,
        "left": 10,
        "width": "96%",
        "borderTop": "1px solid #dfe7ed"
    },
    "popup-holderadd-new popup-body-holder user-block separator": {
        "position": "absolute",
        "bottom": 0,
        "left": 10,
        "width": "96%",
        "borderTop": "1px solid #dfe7ed"
    },
    "popup-body-holder user-block img-holder": {
        "float": "left",
        "width": 41,
        "height": 41
    },
    "popup-body-holder user-block user-details": {
        "float": "left",
        "marginLeft": 21
    },
    "popup-body-holder user-block img-holder img": {
        "width": "100%",
        "height": "auto",
        "borderRadius": 4
    },
    "popup-body-holder user-block permission": {
        "fontSize": 0.857,
        "color": "#2d5164"
    },
    "popup-body-holder user-block permissionowner": {
        "marginTop": 8,
        "marginRight": 120,
        "float": "right",
        "fontSize": 0.857,
        "color": "#2d5164"
    },
    "popup-body-holder user-blockshared permission": {
        "marginTop": 8,
        "marginRight": 85
    },
    "popup-body-holder user-blockshared permission select": {
        "background": "transparent",
        "boxShadow": "none",
        "border": "none",
        "float": "right",
        "font": "11px 'montserratsemi_bold', sans-serif",
        "outline": "none",
        "color": "#2d5164"
    },
    "popup-body-holder user-blockshared permission p": {
        "background": "transparent",
        "boxShadow": "none",
        "border": "none",
        "float": "right",
        "font": "11px 'montserratsemi_bold', sans-serif",
        "outline": "none",
        "color": "#2d5164"
    },
    "popup-body-holder user-block action": {
        "marginTop": 5,
        "marginRight": 20,
        "float": "right",
        "fontSize": 0.857,
        "color": "#2d5164"
    },
    "popup-body-holderadd-new user-block action": {
        "marginTop": 5,
        "marginRight": 0
    },
    "popup-body-holder user-block action btn-remove": {
        "paddingTop": 3,
        "paddingRight": 10,
        "paddingBottom": 3,
        "paddingLeft": 10,
        "border": "none",
        "borderRadius": "100%",
        "backgroundColor": "#FFFFFF",
        "boxShadow": "0px 1px 5px -1px #000",
        "outline": "none"
    },
    "popup-body-holder user-block action btn-add": {
        "paddingTop": 3,
        "paddingRight": 10,
        "paddingBottom": 3,
        "paddingLeft": 10,
        "border": "none",
        "borderRadius": "100%",
        "backgroundColor": "#FFFFFF",
        "boxShadow": "0px 1px 5px -1px #000",
        "outline": "none"
    },
    "popup-body-holder user-block action btn-remove fa-minus": {
        "color": "#61b3de",
        "marginTop": 6
    },
    "popup-body-holder user-block action btn-add fa-plus": {
        "color": "#61b3de",
        "marginTop": 6
    },
    "popup-body-holder user-details user-name": {
        "marginTop": 5,
        "marginRight": 0,
        "marginBottom": 2,
        "marginLeft": 0,
        "fontSize": 1,
        "color": "#2d5164"
    },
    "popup-body-holderadd-new user-details user-name": {
        "marginTop": 10,
        "marginRight": 0,
        "marginBottom": 5,
        "marginLeft": 0
    },
    "popup-body-holder user-details more-info": {
        "fontSize": 0.714,
        "color": "#2d5164"
    },
    "popup-holder footer-holder": {
        "width": "100%",
        "height": 33,
        "paddingTop": 7,
        "paddingRight": 15,
        "paddingBottom": 7,
        "paddingLeft": 15,
        "fontSize": 0.857,
        "backgroundColor": "#cedae2"
    },
    "popup-holder footer-holder add-new": {
        "float": "right"
    },
    "popup-holder footer-holder add-new button": {
        "color": "#2d5164",
        "outline": "none"
    },
    "popup-holder footer-holder btn-link": {
        "textDecoration": "none"
    },
    "popup-holder footer-holder see-all": {
        "textAlign": "center"
    },
    "popup-holder footer-holder see-all button": {
        "color": "#2d5164",
        "outline": "none"
    },
    "workmode-overlay-holder container": {
        "marginTop": 70
    },
    "workmode-overlay-holder secretary-holder": {
        "position": "relative",
        "float": "left"
    },
    "workmode-overlay-holder secretary-holder img": {
        "WebkitBorderRadius": 5,
        "MozBorderRadius": 5,
        "borderRadius": 5
    },
    "workmode-overlay-holder msg-holder": {
        "position": "relative",
        "float": "left",
        "marginLeft": 25,
        "backgroundColor": "#FFFFFF",
        "paddingTop": 5,
        "paddingRight": 25,
        "paddingBottom": 5,
        "paddingLeft": 25,
        "fontSize": 16,
        "borderRadius": "0px 20px 20px"
    },
    "workmode-overlay-holder msg-holder h3": {
        "fontSize": 16
    },
    "workmode-overlay-holder msg-holder arrow": {
        "position": "absolute",
        "top": 0,
        "left": -9
    },
    "work-mode-container inner-wrapper": {
        "marginTop": 15,
        "marginRight": 0,
        "marginBottom": 15,
        "marginLeft": 0,
        "paddingTop": 15,
        "paddingRight": 45,
        "paddingBottom": 15,
        "paddingLeft": 45,
        "background": "#f2f6f9",
        "borderRadius": 5,
        "WebkitBoxShadow": "0px 0px 5px 0px rgba(0,0,0,0.75)",
        "MozBoxShadow": "0px 0px 5px 0px rgba(0,0,0,0.75)",
        "boxShadow": "0px 0px 5px 0px rgba(0,0,0,0.75)"
    },
    "work-mode-container inner-wrapper header-section": {
        "textAlign": "center",
        "marginBottom": 20
    },
    "work-mode-container inner-wrapper section-text": {
        "fontSize": 1.429,
        "fontFamily": "\"montserratregular\", sans-serif",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "textTransform": "uppercase",
        "position": "relative",
        "paddingTop": 5,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 55,
        "display": "inline-block"
    },
    "work-mode-container header-section section-text:before": {
        "content": "\"\"",
        "position": "absolute",
        "top": 0,
        "left": 0,
        "width": 35,
        "height": 29,
        "background": "url(\"../images/wm-icons.png\") no-repeat center top"
    },
    "work-mode-container opt-wrapper opt-block": {
        "paddingTop": 12,
        "paddingRight": 32,
        "paddingBottom": 12,
        "paddingLeft": 32,
        "borderRadius": 5,
        "background": "#fff",
        "border": "1px solid #d8e2eb",
        "marginBottom": 10
    },
    "opt-wrapper field-holder": {
        "float": "left",
        "marginTop": 5,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 15
    },
    "work-mode-container opt-wrapper opt-block icon": {
        "float": "left",
        "width": 35,
        "height": 30,
        "background": "url(\"../images/wm-icons.png\") no-repeat"
    },
    "work-mode-container opt-wrapper opt-block bar-block": {
        "backgroundPosition": "center bottom"
    },
    "work-mode-container opt-wrapper opt-block newsfeed-block": {
        "backgroundPosition": "center -165px"
    },
    "work-mode-container opt-wrapper opt-block voice-video-block": {
        "backgroundPosition": "center -39px"
    },
    "work-mode-container opt-wrapper opt-block msg-block": {
        "backgroundPosition": "center -202px"
    },
    "work-mode-container opt-wrapper opt-block notifications-block": {
        "backgroundPosition": "center -81px"
    },
    "work-mode-container opt-wrapper opt-block all-block": {
        "backgroundPosition": "center -119px"
    },
    "opt-wrapper field-holder label": {
        "fontSize": 1,
        "fontFamily": "\"montserratregular\", sans-serif",
        "textTransform": "capitalize",
        "color": "#2d5164",
        "cursor": "pointer",
        "position": "relative",
        "paddingLeft": 38,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "lineHeight": 1.7
    },
    "opt-wrapper field-holder input[type=\"checkbox\"]": {
        "display": "none"
    },
    "opt-wrapper field-holder label:before": {
        "content": "\"\"",
        "position": "absolute",
        "top": 0,
        "left": 0,
        "width": 22,
        "height": 22,
        "border": "2px solid #dee6eb",
        "borderRadius": 5
    },
    "opt-wrapper field-holder input[type=\"checkbox\"]:checked + label:before": {
        "content": "\"\\f00c\"",
        "fontFamily": "'fontAwesome'",
        "width": 22,
        "height": 22,
        "textAlign": "center",
        "background": "#61b3de",
        "borderRadius": 5,
        "border": "none",
        "lineHeight": 1.6,
        "color": "#fff"
    },
    "time-holder inner-wrapper": {
        "background": "#fff",
        "boxShadow": "none",
        "border": "2px solid #61b3de",
        "paddingTop": 18,
        "paddingRight": 12,
        "paddingBottom": 18,
        "paddingLeft": 12
    },
    "time-holder section-title": {
        "fontFamily": "'montserratsemi_bold', sans-serif",
        "fontSize": 1,
        "marginTop": 10,
        "marginRight": 0,
        "marginBottom": 18,
        "marginLeft": 0
    },
    "time-holder opt-holder": {
        "overflow": "hidden"
    },
    "time-holder opt-block": {
        "float": "left",
        "marginRight": 30
    },
    "time-holder opt-block:last-child": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "time-holder opt-holder field-holder label": {
        "fontSize": 0.9,
        "fontFamily": "\"montserratregular\", sans-serif",
        "textTransform": "capitalize",
        "color": "#7694a2",
        "cursor": "pointer"
    },
    "time-holder opt-holder input[type=\"checkbox\"]": {
        "display": "none"
    },
    "time-holder opt-holder label": {
        "position": "relative",
        "paddingLeft": 32,
        "textTransform": "capitalize",
        "fontSize": 1,
        "color": "#2d5164",
        "cursor": "pointer",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "lineHeight": 1.7
    },
    "time-holder opt-holder label:before": {
        "content": "\"\"",
        "position": "absolute",
        "top": 0,
        "left": 0,
        "width": 22,
        "height": 22,
        "border": "2px solid #dee6eb",
        "borderRadius": 5
    },
    "time-holder opt-holder input[type=\"checkbox\"]:checked + label:before": {
        "content": "\"\\f00c\"",
        "fontFamily": "'fontAwesome'",
        "width": 22,
        "height": 22,
        "textAlign": "center",
        "background": "#61b3de",
        "borderRadius": 5,
        "border": "none",
        "lineHeight": 1.6,
        "color": "#fff"
    },
    "time-holder time-wrapper": {
        "position": "relative",
        "paddingBottom": 25,
        "paddingRight": "10%"
    },
    "time-holder time-wrapper:after": {
        "content": "\"\"",
        "width": 1,
        "height": "100%",
        "background": "#d7e2ea",
        "position": "absolute",
        "top": 0,
        "right": 0
    },
    "time-holder date-holder": {
        "position": "relative",
        "paddingLeft": "10%"
    },
    "time-holder date-holder:before": {
        "content": "\"OR\"",
        "position": "absolute",
        "top": 35,
        "left": -7,
        "width": 15,
        "height": 18,
        "background": "#ffffff",
        "color": "#7795a8",
        "fontSize": 0.643,
        "lineHeight": 2,
        "fontFamily": "'montserratsemi_bold', sans-serif"
    },
    "time-holder date-holder field-holder": {
        "float": "left",
        "marginRight": 10,
        "position": "relative"
    },
    "date-holder field-holder fa": {
        "position": "absolute",
        "right": 6,
        "bottom": 8,
        "fontSize": 0.8,
        "color": "#a2b1c0"
    },
    "time-holder date-holder field-holder:last-child": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "date-holder field-holder field-label": {
        "display": "block",
        "textTransform": "uppercase",
        "color": "#7795a8",
        "fontSize": 0.7,
        "fontFamily": "'montserratsemi_bold', sans-serif",
        "marginBottom": 5
    },
    "date-holder field-holder form-control": {
        "width": 48,
        "height": 26,
        "borderRadius": 5,
        "borderColor": "#d7e2ea",
        "fontSize": 0.714,
        "color": "#2d5164",
        "fontFamily": "\"montserratregular\", sans-serif"
    },
    "date-holder field-holder selectform-control": {
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "width": 56
    },
    "date-holder field-holder react-datepicker__input-container input": {
        "width": 96
    },
    "time-holder btn-holder": {
        "float": "left",
        "width": "100%",
        "textAlign": "right",
        "marginTop": 20
    },
    "time-holder btn-holder set-btn": {
        "background": "#a4becd",
        "color": "#fff",
        "textTransform": "uppercase",
        "fontSize": 0.857,
        "fontFamily": "\"montserratregular\", sans-serif",
        "paddingTop": 10,
        "paddingRight": 32,
        "paddingBottom": 10,
        "paddingLeft": 32,
        "border": "none"
    },
    "work-mode-container mode-notice": {
        "float": "left",
        "background": "#f8fbfc",
        "border": "1px solid #d6e1ea",
        "borderRadius": 5,
        "paddingTop": 12,
        "paddingRight": 5,
        "paddingBottom": 12,
        "paddingLeft": 14,
        "cursor": "pointer",
        "position": "relative"
    },
    "work-mode-container mode-notice title": {
        "fontFamily": "\"montserratregular\", sans-serif",
        "color": "#7694a2",
        "fontSize": 1,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "float": "left"
    },
    "work-mode-container mode-notice fa-times": {
        "float": "left",
        "marginTop": 0,
        "marginRight": 2,
        "marginBottom": 0,
        "marginLeft": 8,
        "color": "#9dadbd",
        "fontSize": 0.8,
        "lineHeight": 1.5
    },
    "inner-wrapper btn-holder": {
        "float": "right"
    },
    "inner-wrapper btn-holder submit": {
        "background": "#61b3de",
        "border": 0,
        "paddingTop": 12,
        "paddingRight": 40,
        "paddingBottom": 12,
        "paddingLeft": 40,
        "color": "#fff",
        "textTransform": "uppercase",
        "fontFamily": "\"montserratregular\", sans-serif",
        "fontSize": 0.95
    },
    "dialog--jss-0-0workmode-popup-holder": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "background": "none",
        "boxShadow": "none"
    },
    "workmode-popup-wrapper close-icon": {
        "position": "absolute",
        "top": 30,
        "right": 20,
        "cursor": "pointer",
        "fontSize": 1.2,
        "color": "#9dadbd"
    },
    "work-mode-container close-holder": {
        "position": "absolute",
        "top": 30,
        "right": 35,
        "zIndex": 1
    },
    "work-mode-container form": {
        "position": "relative",
        "zIndex": 0
    },
    "workmode-popup-holder closeButton--jss-0-1": {
        "left": "auto",
        "right": 18,
        "zIndex": 10000,
        "position": "relative",
        "float": "right",
        "top": 27,
        "width": 12,
        "height": 20,
        "cursor": "pointer"
    },
    "workmode-popup-holder closeButton--jss-0-1:hover": {
        "transform": "none",
        "textDecoration": "none"
    },
    "workmode-popup-holder closeButton--jss-0-1:before": {
        "content": "\"\\f00d\"",
        "fontFamily": "\"FontAwesome\"",
        "color": "#a4becd",
        "fontSize": 1.3
    },
    "workmode-popup-holder closeButton--jss-0-1 svg": {
        "display": "none"
    },
    "pg-newsfeed-page": {
        "position": "relative"
    },
    "pg-newsfeed-page workmode-overlay-holder": {
        "width": "calc(100vw - 220px)",
        "height": "calc(100vh - 180px)",
        "position": "fixed",
        "background": "rgba(0, 0, 0, 0.9)",
        "top": 70
    },
    "pg-footer-left-options-panel notifi-type-holder": {
        "borderBottom": "1px solid #F2F6F9",
        "cursor": "pointer",
        "textAlign": "center",
        "position": "relative"
    },
    "pg-footer-left-options-panel notifi-type-holder:last-child": {
        "border": "none"
    },
    "pg-footer-left-options-panel notifi-type-holder fa": {
        "color": "#fff",
        "paddingTop": 11,
        "paddingRight": 7,
        "paddingBottom": 11,
        "paddingLeft": 7
    },
    "pg-footer-left-options-panel notifi-type-holder notifi-counter": {
        "color": "#E82107",
        "position": "absolute",
        "bottom": 0,
        "right": 3,
        "fontSize": 0.7
    },
    "notifi-popup-holder": {
        "position": "fixed",
        "bottom": 130,
        "left": 120,
        "width": 300,
        "height": 400,
        "background": "#fff",
        "zIndex": 3,
        "WebkitBoxShadow": "0px 2px 18px 0px rgba(0,0,0,0.75)",
        "MozBoxShadow": "0px 2px 18px 0px rgba(0,0,0,0.75)",
        "boxShadow": "0px 2px 18px 0px rgba(0,0,0,0.75)",
        "borderRadius": 3
    },
    "notifi-popup-holder inner-wrapper": {
        "position": "relative"
    },
    "notifi-popup-holder inner-wrapper:after": {
        "content": "\"\"",
        "position": "absolute",
        "left": 0,
        "bottom": -20,
        "width": 16,
        "height": 16,
        "background": "url(../images/notify-arrow.png) no-repeat 0 0"
    },
    "notifi-popup-holder header-holder": {
        "paddingTop": 15,
        "paddingRight": 15,
        "paddingBottom": 15,
        "paddingLeft": 15,
        "position": "relative",
        "textAlign": "center",
        "borderBottom": "1px solid #ECEEF1"
    },
    "notifi-popup-holder header-holder close": {
        "position": "absolute",
        "top": 5,
        "right": 5,
        "cursor": "pointer",
        "color": "#000",
        "fontSize": 0.8,
        "opacity": 0.3
    },
    "notifi-popup-holder header-holder close:hover": {
        "opacity": 1
    },
    "notifi-popup-holder header-holder section-title": {
        "fontFamily": "\"montserratregular\", sans-serif",
        "display": "inline-block",
        "marginTop": 3,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "fontSize": 1.05,
        "position": "relative",
        "paddingLeft": 25
    },
    "header-holder section-title fa": {
        "position": "absolute",
        "top": 1,
        "left": 0,
        "color": "#61B3DE"
    },
    "notifi-popup-holder header-holder notifi-count": {
        "display": "inline-block",
        "color": "#E94834",
        "marginLeft": 5,
        "fontSize": 0.8
    },
    "notifi-popup-holder header-holder arrow": {
        "position": "absolute",
        "top": 15,
        "color": "#9ABFE3",
        "cursor": "pointer",
        "fontSize": 1.5,
        "opacity": 0.7
    },
    "notifi-popup-holder header-holder arrow:hover": {
        "opacity": 1
    },
    "notifi-popup-holder header-holder fa-angle-left": {
        "left": 15
    },
    "notifi-popup-holder header-holder fa-angle-right": {
        "right": 15
    },
    "notifi-popup-holder conv-holder msg-holder:hover a": {
        "textDecoration": "none"
    },
    "notifi-popup-holder notifications-holder connection-name": {
        "font": "0.8em \"montserratregular\", sans-serif",
        "color": "#61b3de",
        "display": "block",
        "marginBottom": 2
    },
    "notifi-popup-holder notifications-holder type-of-action": {
        "font": "11px 'montserratregular', sans-serif",
        "color": "#2d5164",
        "marginTop": -1,
        "fontSize": 0.7
    },
    "notifi-popup-holder notifications-holder chat-date": {
        "font": "0.6em 'montserratsemi_bold', sans-serif",
        "position": "absolute",
        "right": 10,
        "bottom": 0,
        "color": "#7795a8"
    },
    "notifi-popup-holder all-notifications a": {
        "color": "#61b3de",
        "display": "block",
        "font": "1em \"montserratregular\",sans-serif",
        "textAlign": "center",
        "textDecoration": "none"
    },
    "notifi-popup-holder notifications-holder": {
        "height": 318
    },
    "notifi-popup-holder all-notifications": {
        "borderTop": "1px solid #ECEEF1",
        "paddingTop": 7
    },
    "notifi-popup-holder all-notifications a:hover": {
        "textDecoration": "none"
    },
    "notifi-popup-holder conv-holder msg-holderread": {
        "background": "#fff"
    },
    "notifi-popup-holder NotificationList msg-holder": {
        "minHeight": 66
    },
    "add-chanel-popup popup-header": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "add-chanel-popup popup-header popup-title": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "1.2em \"montserratregular\",sans-serif",
        "float": "left"
    },
    "middle-content-wrapper": {
        "minWidth": 500
    },
    "RichEditor-root": {
        "background": "#fff",
        "border": "1px solid #ddd",
        "fontFamily": "'Georgia', serif",
        "fontSize": 14,
        "paddingTop": 15,
        "paddingRight": 15,
        "paddingBottom": 15,
        "paddingLeft": 15
    },
    "note-title-holder": {
        "marginTop": 20,
        "marginBottom": 15
    },
    "note-title-holder edit-note-header": {
        "font": "16px 'montserratlight', sans-serif",
        "color": "#2d5164",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 5,
        "marginLeft": 0,
        "textTransform": "uppercase"
    },
    "RichEditor-editor": {
        "borderTop": "1px solid #ddd",
        "cursor": "text",
        "fontSize": 16,
        "marginTop": 10
    },
    "RichEditor-editor public-DraftEditorPlaceholder-root": {
        "marginTop": 0,
        "marginRight": -15,
        "marginBottom": -15,
        "marginLeft": -15,
        "paddingTop": 15,
        "paddingRight": 15,
        "paddingBottom": 15,
        "paddingLeft": 15
    },
    "RichEditor-editor public-DraftEditor-content": {
        "marginTop": 0,
        "marginRight": -15,
        "marginBottom": -15,
        "marginLeft": -15,
        "paddingTop": 15,
        "paddingRight": 15,
        "paddingBottom": 15,
        "paddingLeft": 15,
        "minHeight": 100
    },
    "RichEditor-hidePlaceholder public-DraftEditorPlaceholder-root": {
        "display": "none"
    },
    "RichEditor-editor RichEditor-blockquote": {
        "borderLeft": "5px solid #eee",
        "color": "#666",
        "fontFamily": "'Hoefler Text', 'Georgia', serif",
        "fontStyle": "italic",
        "marginTop": 16,
        "marginRight": 0,
        "marginBottom": 16,
        "marginLeft": 0,
        "paddingTop": 10,
        "paddingRight": 20,
        "paddingBottom": 10,
        "paddingLeft": 20
    },
    "RichEditor-editor public-DraftStyleDefault-pre": {
        "backgroundColor": "rgba(0, 0, 0, 0.05)",
        "fontFamily": "'Inconsolata', 'Menlo', 'Consolas', monospace",
        "fontSize": 16,
        "paddingTop": 20,
        "paddingRight": 20,
        "paddingBottom": 20,
        "paddingLeft": 20
    },
    "RichEditor-controls": {
        "fontFamily": "'Helvetica', sans-serif",
        "fontSize": 14,
        "marginBottom": 5,
        "userSelect": "none"
    },
    "RichEditor-styleButton": {
        "color": "#999",
        "cursor": "pointer",
        "marginRight": 16,
        "paddingTop": 2,
        "paddingRight": 0,
        "paddingBottom": 2,
        "paddingLeft": 0
    },
    "RichEditor-activeButton": {
        "color": "#5890ff"
    },
    "submit-note-btn": {
        "font": "11px 'montserratsemi_bold', sans-serif",
        "color": "#fff",
        "width": "auto",
        "textAlign": "center",
        "backgroundColor": "#61b3de",
        "WebkitBorderRadius": 5,
        "MozBorderRadius": 5,
        "borderRadius": 5,
        "paddingTop": 4,
        "paddingRight": 10,
        "paddingBottom": 4,
        "paddingLeft": 10,
        "marginTop": 20,
        "display": "block",
        "textDecoration": "none",
        "textTransform": "uppercase",
        "float": "right"
    },
    "public-DraftEditorPlaceholder-inner": {
        "color": "#999"
    },
    "confirmation_p": {
        "color": "#2d5164",
        "font": "20px \"montserratsemi_bold\",sans-serif"
    },
    "confirm-no": {
        "backgroundColor": "#a4becd",
        "marginRight": 20,
        "float": "right",
        "color": "#FFF"
    },
    "editor-popup-holder": {
        "background": "url(../images/pop-up-back.png) no-repeat 0 0 / cover",
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "borderRadius": 3,
        "overflow": "hidden"
    },
    "popup-header": {
        "overflow": "hidden",
        "marginTop": 5,
        "marginRight": 0,
        "marginBottom": 10,
        "marginLeft": 0,
        "position": "relative"
    },
    "popup-header span": {
        "cursor": "pointer"
    },
    "extra-func-btns span": {
        "cursor": "pointer",
        "display": "inline-block"
    },
    "popup-header closeBtn": {
        "width": 13,
        "height": 13,
        "display": "block",
        "position": "absolute",
        "top": 0,
        "left": 0,
        "marginTop": 5,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 5,
        "zIndex": 1,
        "background": "url(../images/pop_up_close.png) no-repeat 0 0"
    },
    "extra-func": {
        "float": "left",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "title-holder": {
        "float": "left",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "extra-func > form-control": {
        "float": "left",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "popup-header toolbar-toggle-btn-holder": {
        "float": "left",
        "border": "1px solid #90a2b1",
        "borderRadius": 5,
        "marginLeft": 15,
        "height": 23,
        "overflow": "hidden"
    },
    "popup-header extra-func-btns": {
        "float": "left",
        "border": "1px solid #90a2b1",
        "borderRadius": 5,
        "marginLeft": 15,
        "height": 23,
        "overflow": "hidden"
    },
    "toolbar-toggle-btn-holder span": {
        "display": "inline-block"
    },
    "toolbar-toggle-btn-holder text-format-menu": {
        "width": 33,
        "height": 23,
        "background": "url(../images/tlbr-fonts-toggle-btn.png) #fff no-repeat center center",
        "borderRight": "1px solid #90a2b1"
    },
    "toolbar-toggle-btn-holder text-style-menu": {
        "width": 33,
        "height": 23,
        "background": "url(../images/tlbr-font-styles-toggle-btn.png) #fff no-repeat center center"
    },
    "extra-func-btns export-btn": {
        "width": 45,
        "height": 23,
        "borderRight": "1px solid #90a2b1",
        "background": "url(../images/export-btn-bg.png) #5f778b no-repeat center center"
    },
    "extra-func-btns email-btn": {
        "width": 33,
        "height": 23,
        "background": "url(../images/email-btn-bg.png) #fff no-repeat center center"
    },
    "extra-func form-control": {
        "width": 114,
        "height": 23,
        "font": "10px \"montserratregular\",sans-serif",
        "border": "1px solid #90a2b1",
        "paddingTop": 6,
        "paddingRight": 0,
        "paddingBottom": 5,
        "paddingLeft": 8,
        "marginLeft": 10
    },
    "popup-header note-title": {
        "background": "none",
        "border": "none",
        "boxShadow": "none",
        "color": "#2d5164",
        "float": "right",
        "font": "14px \"montserratsemi_bold\",sans-serif",
        "height": 23,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 2,
        "paddingRight": 0,
        "paddingBottom": 1,
        "paddingLeft": 0,
        "position": "relative",
        "textAlign": "center",
        "width": 250,
        "zIndex": 0
    },
    "popup-header note-title:focus": {
        "borderBottom": "1px solid #fff"
    },
    "editor-popup-holder quill-contents": {
        "background": "#fff"
    },
    "editor-popup-holder btn": {
        "float": "right",
        "font": "11px 'montserratsemi_bold', sans-serif",
        "color": "#fff",
        "backgroundColor": "#61b3de",
        "textTransform": "uppercase",
        "border": "none",
        "marginTop": 12,
        "marginRight": 0,
        "marginBottom": 5,
        "marginLeft": 0
    },
    "editor-popup-holder btnbtn-read-only": {
        "float": "right",
        "font": "11px 'montserratsemi_bold', sans-serif",
        "color": "#fff",
        "backgroundColor": "#de6178",
        "textTransform": "uppercase",
        "border": "none",
        "marginTop": 12,
        "marginRight": 0,
        "marginBottom": 5,
        "marginLeft": 0
    },
    "rich-editor-holder quill-toolbar": {
        "position": "fixed",
        "marginTop": 0,
        "marginRight": 5,
        "marginBottom": 0,
        "marginLeft": 5,
        "paddingTop": 8,
        "paddingRight": 0,
        "paddingBottom": 8,
        "paddingLeft": 0,
        "width": "49%",
        "zIndex": 1,
        "backgroundColor": "#fff"
    },
    "dialog--jss-0-0note-popup": {
        "transform": "none !important"
    },
    "rich-editor-holder quill-contents": {
        "position": "relative",
        "zIndex": 0
    },
    "editor-popup-holder ql-editor": {
        "minHeight": "340px !important",
        "marginTop": 40
    },
    "editor-popup-holder ql-align ql-picker-label": {
        "textIndent": -9999
    },
    "editor-popup-holder ql-align ql-picker-item": {
        "textIndent": -9999
    },
    "editor-popup-holder ql-format-buttonql-link": {
        "display": "none"
    },
    "blue_i": {
        "color": "#428bca"
    },
    "dialog--jss-0-0 cropper-bg": {
        "background": "#fff"
    },
    "pg-status-delete-icon": {
        "float": "right",
        "color": "#ccc"
    },
    "pg-comment-delete-icon": {
        "float": "right",
        "color": "#ccc",
        "marginRight": 5,
        "marginTop": 5
    },
    "post-img-holder": {
        "position": "relative"
    },
    "post-img-close": {
        "float": "right",
        "position": "absolute",
        "top": 5,
        "right": 5,
        "cursor": "pointer"
    },
    "post-video-play": {
        "float": "right",
        "position": "absolute",
        "top": 20,
        "right": 40,
        "cursor": "pointer",
        "color": "white"
    }
});