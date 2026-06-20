# Setting up `/products` Subdomain on Name.com for Vercel

If you want to deploy the FocusFlow app to Vercel on a dedicated subdomain such as **`products.mr-nagabhushanaraju-s.engineer`**, you need to link Vercel and your Name.com DNS settings.

### Step 1: Add the Custom Domain in Vercel
1. Go to your **Vercel Dashboard**.
2. Select the deployed project (FocusFlow).
3. Go to **Settings > Domains**.
4. In the text field, enter: `products.mr-nagabhushanaraju-s.engineer` and click **Add**.
5. Vercel will attempt to verify the domain and display an "Invalid Configuration" message. It will instruct you to create a **CNAME** record.

### Step 2: Configure Name.com DNS
1. Log into your **Name.com** account.
2. In the "Quick Actions" or Domain Management section for `mr-nagabhushanaraju-s.engineer`, click **Manage DNS Records**.
3. Under "Add a new record", fill in the following details:
   - **Type:** `CNAME`
   - **Host:** `products` (This represents the `/products` subdomain part).
   - **Answer (Target):** `cname.vercel-dns.com.` (Make sure to include the trailing dot if Name.com requires it, but usually `cname.vercel-dns.com` works fine).
   - **TTL:** `300` (or leave default).
4. Click **Add Record**.

### Step 3: Wait for Propagation
DNS changes can take anywhere from a few minutes to up to 24-48 hours. Vercel will constantly check for this `CNAME` record.
Once verified, Vercel will automatically provision a free SSL certificate, and your deployment will be fully accessible at:

`https://products.mr-nagabhushanaraju-s.engineer`

*Note: Since Vercel automatically deploys to the root of the domain provided (e.g. `products.domain.com`), this avoids path-routing complexities associated with trying to host it directly under `domain.com/products` alongside an existing portfolio.*
