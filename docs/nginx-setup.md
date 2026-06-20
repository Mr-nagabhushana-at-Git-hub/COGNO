# Virtual Machine Nginx Proxy Setup

This guide configures Nginx as a reverse proxy for your PM2-managed Node.js application.

## Prerequisites
- Node.js & PM2 installed
- The project built via `npm run build`
- PM2 running via `pm2 start ecosystem.config.js`

## Nginx Configuration

Create a new Nginx block in `/etc/nginx/sites-available/focusflow`:

```nginx
server {
    listen 80;
    server_name your-vm-domain.com; # Or your IP

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/focusflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

If you are using HTTPS, we recommend generating an SSL certificate with Certbot:
```bash
sudo certbot --nginx -d your-vm-domain.com
```
