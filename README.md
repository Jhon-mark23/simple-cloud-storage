medyo tinatamad ako mag gawa ng readme.md

setup first the cloudflare 
1. Sign up in cloudflare
   
2. open termux and paste this command
```bash
   pkg install cloudflared -y
```
3. paste this command in termux to login cloudflare 
```bash
cloudflared tunnel login
```

4. Create A Named tunnel
   example: my-tunnel
```bash
cloudflared tunnel create my-tunnel
```

5. Create a config file (`~/.cloudflared/config.yml`):
```yaml
tunnel: my-tunnel
credentials-file: /path/to/credentials.json  # From the previous step

# Define what traffic to forward
ingress:
  # Example 1: Expose SSH (TCP)
  - hostname: ssh.yourdomain.com
    service: tcp://localhost:22  # Forward SSH (port 22)

  # Example 2: Expose a web app (HTTP)
  - hostname: app.yourdomain.com
    service: http://localhost:3000  # Forward HTTP (e.g., Node.js)

  # Catch-all rule (optional)
  - service: http_status:404  # Block unmatched requests
```
Replace `yourdomain.com` with your actual domain.


---

6. Route DNS to the Tunnel
Link your subdomain to the tunnel:
```bash
cloudflared tunnel route dns my-tunnel ssh.yourdomain.com
cloudflared tunnel route dns my-tunnel app.yourdomain.com
```
This creates **CNAME records** in Cloudflare DNS.

7.Run the Tunnel
Start the tunnel:
```bash
cloudflared tunnel run my-tunnel
```

8.Access Your Service
**Web Access (if configured):**  
  Visit `https://app.yourdomain.com` in a browser.

---


📂 Unlimited File Upload Server with Cloudflare Tunnel

This project is a simple and fast file upload server built using Node.js, Express, and Multer. It allows users to upload and download files via a browser and automatically exposes the server using Cloudflare Tunnel.


---

🚀 Features

📤 Upload files of any size (no limits)

🧾 View uploaded files in JSON

📥 Download files directly by filename

📂 Automatically stores files in /public/uploads

🔒 Basic security headers included

🌐 Optionally exposes the server using cloudflared tunnel



---

📦 Requirements

Node.js (v14 or newer)

npm

cloudflared (for public tunnel)



---

⚙️ Installation & Usage

# 1. Clone the repository
```git
git clone https://github.com/Jhon-mark23/simple-cloud-storage.git
```
```bash
cd simple-cloud-storage
```

# 2. Install dependencies
npm install

# 3. Create your Cloudflare tunnel first (if not done yet)
cloudflared tunnel create my-tunnel
cloudflared tunnel route dns yourdomain.com my-tunnel

# 4. Run the server
```node
node index.js
````
> ℹ️ cloudflared tunnel run my-tunnel is auto-started when index.js runs




---

📂 Folder Structure

public/
├── index.html      # Your upload/download UI (create it)
└── uploads/        # Where uploaded files are stored


---

🔗 API Endpoints

GET / → static site

POST /upload → file upload (form field name: file)

GET /files → list uploaded files (JSON)

GET /download/:filename → download specific file



---

🛡️ Security Notes

This project sets basic HTTP security headers, but it is not intended for production without further protection (auth, rate limits, antivirus scanning, etc.).


---

CREATED: MARK MARTINEZ 

---


