module.exports = {
  dependencies: {
    // Stripe solo se usa en Android; evita que se linkee (y se instale su pod) en iOS.
    '@stripe/stripe-react-native': {
      platforms: {
        ios: null,
      },
    },
  },
};
