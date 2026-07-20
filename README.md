# Koreader sync Bridge & Dashboard (ONLY TESTED ON XTEINK X3 CROSSINK)

A lightweight, node.js proxy bridge and dashboard that interfaces with the official KOReader synchronization API (`sync.koreader.rocks`) OR ANY KOREADER SYNCING SERVER! Personally I use xteinks official one. It intercepts progress syncs to change your discord status, making you able to get an automatically updating status that says something similar to "Reading Outer God Needs Warmth (37%) • Last read: 0:18 hours ago". The Last Read section is in Hour : Minute format. You need to use binary / file format syncing for this to work.

---

## Step-by-Step Setup Guide

### 1. Database Installing (I use "MongoDB Atlas" (FREE))

1. Register an account on: [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create your Cluster, and choose the FREE plan! Name it whatever, I personally used "EXAMPLE1". Click "Create Deployment"
3. On the left sidebar under **Security**, click **Database Access** -> **Add New Database User**.
4. Select **Password** as your authentication method.
* **Username:** Choose a database username (e.g., `user123`)
* **Password:** Create a password that you will remember. Save it somewhere safe immediately! You will not be able to retrieve it after closing the window. Choose a "Built-in Role", and change it to "Atlas Admin" (or "Read and write to any database" should still work). Click "Add User"


5. In the same category, under "**Network Access**" -> **IP Access List**. Click "Add IP Address"
6. Type in `0.0.0.0/0` in the "Access List Entry" *This is required so Render's ever changing IPs can reliably connect.* Click Confirm.
7. Return to the **Clusters** page, click **Connect** -> **Drivers**, and copy the connection string. It will look something like this:
`mongodb+srv://user123:<db_password>@EXAMPLE1.example.mongodb.net/?appName=EXAMPLE1`
8. Change the "<db_password>" to whatever password you chose, so if I chose "Fluff123" my string would look something like this:
`mongodb+srv://user123:Fluff123@EXAMPLE1.example.mongodb.net/?appName=EXAMPLE1`
Save that string somewhere, you'll need it later.
9. Create a fork of this repository, and register a **[Render](https://render.com/)** Account.
10. Click "New" on the projects page, and choose "Web Service". Choose your github repository there, you may need to log in with your github account.
11. Scroll down and make sure the Build Command is set to "npm install", and that the Start Command is set to "node server.js".
12. Choose the Free Instance Type and scroll down to the **Environment Variables** section.
13. You will need to create **3 Environment Variables**. For the first Variable, type in **DISCORD_TOKEN**, for the second type in **KOREADER_API**, and lastly, for the third, type in **MONGODB_URI**.
14. In the **Value** section of the **Environment Variables**, paste in your **Discord Token** on the right side of that variable **(OBS) If you do not know how to get your Discord Token, [feel free to check out this tutorial video](https://www.youtube.com/watch?v=LnBnm_tZlyU)**. For the **KOREADER_API** Variable, type in your Koreader sync server you normally use. Lastly, for the **MONGODB_URI** type in the **MongoDB Atlas** string you copied before, so in this example it's `mongodb+srv://user123:Fluff123@cluster0.example.mongodb.net/?appName=EXAMPLE1`
15. Click "Deploy Web Service" at the bottom of the page.
16. Now you'll need to register an account on **[Uptimerobot](https://dashboard.uptimerobot.com/)** or any other similar sites that could keep a website online. Create a new monitor, and paste in your render website link. It may look something like **"[https://example-app.onrender.com](https://www.google.com/search?q=https://example-app.onrender.com)"**. Create the monitor.
17. You're practically done, congratulations! Now it's just one more tiny step left! Go on each of your reading devices, may it be readest on ios, koreader on a e-reader, or something else. Change your koreader sync server to your render.com web service link + "/api/koreader".
***(OBS/WARNING FOR E-READERS):*** Some e-readers (Xteink, etc. (**I´ve only tried this project on my xteink...**) have very strict networking and **MUST use HTTPS** or you will get a "json parse error". Mobile apps (like Readest) work better fallback to **HTTP**.
* For E-readers type in: **"[https://example-app.onrender.com/api/koreader](https://www.google.com/search?q=https://example-app.onrender.com/api/koreader)"** (Or at the very least for Xteink, since I got a json error when I used http on my xteink... I have yet to try this on other E-readers, though... please comment on that!)
* For Mobile Apps type in: **"[http://example-app.onrender.com/api/koreader](https://www.google.com/search?q=http://example-app.onrender.com/api/koreader)"** (I believe https also works? I never went around to trying it, since I wanted to publish this.)


18. Make sure your Document(Book/Novel) Matching Method inside your device settings is set to **Binary**/**File Content**. Sweet, you're done! Congratulations! Now it's just how to use it (SCROLL DOWN).

---

## How to use it?

Feel free to push one of your books, or novels, etc, to your server like usual, then go onto your website. So I'll go to "[https://example-app.onrender.com](https://www.google.com/search?q=https://example-app.onrender.com)". If everything is done, it should look something like this:
<img width="1853" height="678" alt="image" src="https://github.com/user-attachments/assets/e04bd779-9032-46e1-8583-afadbd2defc5" />
Change the outlined text to your book, or novels name, and you're done! Each time you push your reading progress to the cloud it will update your discord status with your reading progress, and when you last read! So mine looks like this right now: **Reading Unknown Novel (0%) • Last read: 0:01 hours ago** since I just uploaded that novel in the picture above.
