# Innerstone Counseling

Static site for Innerstone Counseling. GoDaddy cPanel publishes it as plain files for the primary domain.

## GoDaddy cPanel (Git Version Control)

The domain is the primary domain on the cPanel account, so the public files belong in the account’s `public_html` directory. `.cpanel.yml` copies only those files there:

- `index.html`, `styles.css`, and `script.js`
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
