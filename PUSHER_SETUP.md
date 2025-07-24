# Pusher Setup Instructions

## 1. Create a Pusher Account
1. Go to https://pusher.com/
2. Sign up for a free account
3. Create a new app (choose "React" as framework)

## 2. Get Your Configuration Keys
From your Pusher dashboard, copy these values:
- App ID
- Key
- Secret
- Cluster

## 3. Add Environment Variables
Add these to your `.env.local` file:

```env
# Pusher Configuration
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster

# Public keys for client-side usage
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

## 4. Restart Your Development Server
After adding the environment variables, restart your development server:

```bash
npm run dev
```

## 5. Test Real-Time Features
1. Open your forum in multiple browser tabs
2. Create a new post in one tab
3. Watch it appear in real-time in other tabs
4. Vote on posts and see updates instantly
5. Enable browser notifications for urgent alerts

## Free Tier Limits
- 100 concurrent connections
- 200,000 messages per day
- Perfect for development and small communities

## Security Notes
- Never commit your `.env.local` file to version control
- Keep your secret key secure
- Only use public keys in client-side code 