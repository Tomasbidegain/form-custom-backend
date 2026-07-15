import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import prisma from './database'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        })

        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              name: profile.name?.givenName || user.name,
              lastName: profile.name?.familyName || user.lastName,
              photoUrl: profile.photos?.[0]?.value || user.photoUrl,
            },
          })
          return done(null, user)
        }

        const email = profile.emails?.[0]?.value
        if (email) {
          user = await prisma.user.findUnique({
            where: { email },
          })

          if (user) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                isVerified: true,
                photoUrl: profile.photos?.[0]?.value || user.photoUrl,
              },
            })
            return done(null, user)
          }
        }

        user = await prisma.user.create({
          data: {
            email: email!,
            name: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            googleId: profile.id,
            photoUrl: profile.photos?.[0]?.value,
            isVerified: true,
          },
        })

        done(null, user)
      } catch (error) {
        done(error as Error, undefined)
      }
    }
  )
)

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    })
    done(null, user)
  } catch (error) {
    done(error as Error, null)
  }
})

export default passport
