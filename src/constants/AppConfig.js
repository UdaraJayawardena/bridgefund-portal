/**
 * App Config File
 */
const AppConfig = {
    appLogo: require('assets/img/bridgefund_logo.png'),         // App Logo
    appUrl: 'http://localhost:5000',                            // App Url
    brandName: 'Bridgefund',                                    // Brand Name
    navCollapsed: false,                                        // Sidebar collapse
    darkMode: false,                                            // Dark Mode
    boxLayout: false,                                           // Box Layout
    rtlLayout: false,                                           // RTL Layout
    miniSidebar: false,                                         // Mini Sidebar
    sidebarActiveFilter: 'dark',                                // Select Sidebar Color You can Choose following color 'primary', 'blue', 'warning', 'info', 'danger','success','purple'
    enableSidebarBackgroundImage: true,                         // Enable Sidebar Background Image
    sidebarImage: require('../assets/img/sidebar-2.jpg'),       // Select sidebar image
    locale: [{
        languageId: 'english',
        locale: 'en',
        name: 'English',
        icon: 'en',
        default: true
    },
    {
        languageId: 'dutch',
        locale: 'nl',
        name: 'Dutch',
        icon: 'nl',
        default: false
    }],
    enableUserTour: true,                                       // Enable / Disable User Tour
    copyRightText: 'Bridgefund © 2021 All Rights Reserved.',    // Copy Right Text
    // light theme colors
    themeColors: {
        'primary': '#5C6AC4',
        'warning': '#EEC200',
        'danger': '#DE3618',
        'success': '#50B83C',
        'info': '#47C1BF',
        'default': '#657786',
        'purple': '#007ACE',
        'sky': '#007ACE',
        'yellow': '#F49342',
        'white': '#FFFFFF',
        'dark': '#000000',
        'greyLighten': '#DFE3E8',
        'grey': '#9FA5AB'
    },
    // dark theme colors
    darkThemeColors: {
        darkBgColor: '#424242'
    },
    apiBaseUrl: 'http://api-gateway.bridgefund.net/v1/', //Base URL for API
    errorPageImage: require('assets/img/error-page.png')

};

export default AppConfig;
