const { withDangerousMod, withProjectBuildGradle } = require('@expo/config-plugins');

// Plugin personalizado para configurar Podfile con static frameworks
function withCustomPodfile(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const fs = require('fs');
      const path = require('path');
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');
        
        // Reemplazar la configuración dinámica de use_frameworks con static
        podfileContent = podfileContent.replace(
          /use_frameworks! :linkage => podfile_properties\['ios\.useFrameworks'\]\.to_sym if podfile_properties\['ios\.useFrameworks'\]\n  use_frameworks! :linkage => ENV\['USE_FRAMEWORKS'\]\.to_sym if ENV\['USE_FRAMEWORKS'\]/g,
          `use_frameworks! :linkage => :static\n  use_modular_headers!`
        );
        
        // Si no se encontró el patrón anterior, buscar el patrón alternativo
        if (!podfileContent.includes('use_modular_headers!')) {
          podfileContent = podfileContent.replace(
            /use_frameworks! :linkage => podfile_properties\['ios\.useFrameworks'\]\.to_sym if podfile_properties\['ios\.useFrameworks'\]/,
            `use_frameworks! :linkage => :static\n  use_modular_headers!`
          );
        }
        
        fs.writeFileSync(podfilePath, podfileContent);
      }
      
      return config;
    },
  ]);
}

// Fuerza versiones de AGP y Kotlin compatibles con androidx.core 1.18.0 / kotlin-stdlib 2.2.0
// (requeridas por expo-iap/openiap-google)
const ANDROID_GRADLE_PLUGIN_VERSION = '8.9.1';
const KOTLIN_GRADLE_PLUGIN_VERSION = '2.2.20';

function withAndroidGradlePluginVersion(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const original = config.modResults.contents;
      config.modResults.contents = original
        .replace(
          /classpath\(['"]com\.android\.tools\.build:gradle(?::[^'"]+)?['"]\)/,
          `classpath('com.android.tools.build:gradle:${ANDROID_GRADLE_PLUGIN_VERSION}')`
        )
        .replace(
          /classpath\(['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin(?::[^'"]+)?['"]\)/,
          `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_GRADLE_PLUGIN_VERSION}')`
        );
    }
    return config;
  });
}


module.exports = ({ config }) => {
  // Aplicar el plugin personalizado
  config = withCustomPodfile(config);
  config = withAndroidGradlePluginVersion(config);

  const isAndroid = process.env.EAS_BUILD_PLATFORM === 'android' || process.env.LOCAL_BUILD_ANDROID === 'true';

  if (isAndroid) {
    config.plugins = [
      ...(config.plugins || []),
      [
        '@stripe/stripe-react-native',
        {
          enableGooglePay: true,
        },
      ],
    ];
  }
  
  return config;
};
