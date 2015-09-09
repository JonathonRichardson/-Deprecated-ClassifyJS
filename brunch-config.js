exports.config = {

  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(bower_components|vendor)/,
        'classify.js': /^app/
      }
    },
    stylesheets: {
      joinTo: 'app.css'
    }
  },

  overrides: {
    production: {
      optimize: true
    }
  },

  plugins: {
    babel: {
      ignore: [/^(bower_components|vendor)/],
      loose: "all"
    }
  }
}
