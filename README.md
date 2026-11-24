# Innerstone Counseling

Static site for Innerstone Counseling. A push to `main` publishes the public files to GoDaddy over FTP. `.cpanel.yml` is still there if you need to deploy by hand from cPanel.

## Automatic deploy (GitHub Actions)

`.github/workflows/deploy.yml` runs on every push to `main`, and when you start it from the Actions tab. It uploads `index.html`, `styles.css`, `script.js`, `.htaccess`, and `images/` (including names that contain spaces) to the FTP account root with explicit FTPS on port 21. `.htaccess` sends plain HTTP to HTTPS. The exclude pattern `**/.git*` does not match `.htaccess`. That account’s root is `public_html`, so the remote folder is `./`.

It does not upload `.git*`, `.github/**`, `server.js`, `package.json`, `package-lock.json`, `README.md`, `CNAME`, `.cpanel.yml`, or `node_modules`. It does not wipe the server. Files the action did not publish, including `cgi-bin` and `.well-known`, stay where they are. The action stores `.ftp-deploy-sync-state.json` in `public_html` so the next deploy uploads only what changed. Leave that file in place.

Add these three repository secrets under **Settings → Secrets and variables → Actions**:

- **FTP_SERVER:** the domain (`innerstonecounseling.com`) or the cPanel server hostname
- **FTP_USERNAME:** the full FTP user, such as `deploy@innerstonecounseling.com`
- **FTP_PASSWORD:** that FTP account’s password

Use the FTP account whose directory is `public_html`. The cPanel login itself is SSH/SFTP and will not work with this workflow.

To run it again, open the **Actions** tab, select **Deploy site**, and choose **Run workflow**. To repeat a run that already happened, open that run and choose **Re-run jobs**.

## Manual fallback (cPanel Git Version Control)

If GitHub Actions cannot reach the server, deploy from cPanel instead. The domain is the primary domain, so the public files belong in `public_html`. `.cpanel.yml` copies only those files there:

- `index.html`, `styles.css`, `script.js`, and `.htaccess`
- the `images/` folder, including filenames that contain spaces

It does not copy `server.js`, `package.json`, `README.md`, `CNAME`, `.git`, or `.cpanel.yml`.

cPanel runs the tasks as bash, as the cPanel user, with the repository checkout as the working directory. An `export` on one task is available to the tasks after it, which is the pattern in [cPanel’s deployment guide](https://go.cpanel.net/GitDeployment). `$HOME` is that account’s home directory in this environment, so the deploy path is `$HOME/public_html/` and the cPanel username is not hardcoded. `$HOME` comes from the account environment, not from `.bashrc`. This repo cannot run a deploy on the GoDaddy account; if a host ever left `$HOME` empty, the copy would target `/public_html/` and fail for a normal account user instead of writing into the repository.

After this file is on the branch cPanel is tracking:

1. In cPanel, open **Git Version Control**, then **Manage** for this repository.
2. Open **Pull or Deploy**.
3. Click **Update from Remote** so the managed clone receives the new commit.
4. Click **Deploy HEAD Commit**. cPanel runs `.cpanel.yml` and copies the site into `public_html`.

The repository checkout must be clean before cPanel will deploy.

## Local preview

`server.js` and `package.json` stay in the repository for a local preview. They are not part of the published site. With Node.js 18 or newer, `npm start` serves the files on port 3000, or on `PORT` when that variable is set.
