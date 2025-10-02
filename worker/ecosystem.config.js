module.exports = {
  apps: [{
    name: 'kenmei-worker',
    script: 'sync-worker.ts',
    interpreter: 'tsx',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/worker-error.log',
    out_file: './logs/worker-out.log',
    time: true,
    cron_restart: '0 */15 * * *', // Restart every 15 minutes as backup
    exp_backoff_restart_delay: 100
  }]
};