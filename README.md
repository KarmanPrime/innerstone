# Innerstone Counseling

Static site for Innerstone Counseling. `server.js` serves the existing files with Node.js so the site can run on GoDaddy cPanel.

## GoDaddy cPanel (Setup Node.js App)

In cPanel, open **Setup Node.js App** and create an application with:

- **Node.js version:** 18 or newer
- **Application root:** this repository folder (the directory that contains `package.json`, `server.js`, and `index.html`)
- **Application startup file:** `server.js`
- **Build command:** none (leave it empty; there is no build step and no dependencies to compile)

cPanel sets `PORT` for Phusion Passenger. The server listens on `process.env.PORT`, or port 3000 when that variable is unset. Locally, start it with `npm start`.
