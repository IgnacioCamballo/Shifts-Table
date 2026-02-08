const appJsonConfig = require('./app.json');
const { withDangerousMod } = require('@expo/config-plugins');

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

module.exports = ({ config }) => {
  // Aplicar el plugin personalizado
  config = withCustomPodfile(appJsonConfig.expo);
  
  return config;
};
