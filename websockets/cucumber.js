module.exports = {
  default: {
    require: ['features/step_definitions/**/*.js'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'junit:test-results/cucumber-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    dryRun: false,
    failFast: false,
    strict: true,
    retry: 0
  },
  ci: {
    require: ['features/step_definitions/**/*.js'],
    format: [
      'json:test-results/cucumber-report.json',
      'junit:test-results/cucumber-report.xml'
    ],
    failFast: true,
    strict: true
  },
  html: {
    require: ['features/step_definitions/**/*.js'],
    format: ['html:test-results/cucumber-report.html']
  }
};
