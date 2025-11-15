import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Database } from "./database.types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import { Dimensions } from 'react-native';
import { formatInTimeZone } from 'date-fns-tz';

// Re-export formatInTimeZone for use in components
export { formatInTimeZone };


export const version = '0.1.0';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key)
  },
}

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


export const constants = { //'pk_test_zRAF7nn7FrwMcRx1gPeQ8wA7'
  stripePublishableKey: process.env.ISTEST === 'TRUE' ? process.env.STRIPE_PUBLIC_KEY_NATIVE_TEST : process.env.STRIPE_PUBLIC_KEY_NATIVE
}


export const endpoints = {
  auth: {
    createSession: 'https://create-session.bottleup.workers.dev',
    initPhoneVerification: 'https://init-phone-verification.bottleup.workers.dev',
    populateUser: 'https://populate-user.bottleup.workers.dev',
    createUser: 'https://create-user.bottleup.workers.dev',
    verifyToken:'https://verify-token.bottleup.workers.dev',
  },
  checkout: {
    createOrder: 'https://create-order.bottleup.workers.dev',
    updateOrder: 'https://update-order.bottleup.workers.dev',
    calculateOrderCost: 'https://calculate-order-cost.bottleup.workers.dev',
    prepareOrderPayment: 'https://prepare-order-payment.bottleup.workers.dev',
    declareStale: 'https://declare-stale.bottleup.workers.dev',
    refundOrder: 'https://refund-order.bottleup.workers.dev',
    confirmOrder: 'https://confirm-order.bottleup.workers.dev'
  },
  messaging: {
    createSupportChat: 'https://create-support-chat.bottleup.workers.dev'
  },
  paymentMethods: {
    createSetupIntent: 'https://payment-methods.bottleup.workers.dev/create-setup-intent'
  }
};

// Worker API helper functions
export const workerAPI = {
  // Initialize phone verification (send SMS)
  initPhoneVerification: async (phoneNumber: string) => {
    const response = await fetch(endpoints.auth.initPhoneVerification, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    return response.json();
  },

  // Create session (verify OTP and create user)
  createSession: async (phoneNumber: string, code: string, userId?: string) => {
    const response = await fetch(endpoints.auth.createSession, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, code, userId })
    });
    return response.json();
  },

  // Populate user profile (supports partial updates)
  populateUser: async (userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
  }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { error: 'Not authenticated' };
    }

    const response = await fetch(endpoints.auth.populateUser, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Create new user (Stripe customer, Supabase user, etc.)
  createUser: async (userData: { authUserId: string, phoneNumber: string, firstName: string, lastName: string, email: string, dateOfBirth: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { error: 'Not authenticated' };
    }

    const response = await fetch(endpoints.auth.createUser, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Verify JWT token
  verifyToken: async (token: string) => {
    const response = await fetch(endpoints.auth.verifyToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return response.json();
  },

  // Payment Methods API
  createSetupIntent: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { error: 'Not authenticated' };
    }

    const response = await fetch(endpoints.paymentMethods.createSetupIntent, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    return response.json();
  }
};


export const theme = {
  color: {
    invisible: "#00000000",
    bgDark: "#05060e",
    bg: "#0a0b1c",
    bgTint: "#181828",
    bgComponent: "#2d3140",
    bgBorderMuted: "#1f202b",
    bgBorder: "#2f2f3e",
    secondary: "#7e8996",
    text: "#ffffff",
    primary: "#50d9e3",
    hamburgerIconColor: "#979797",
    ticket: "#F9CC6F",
    table: "#42FFF2",
    semiTransparentBlack: "rgba(0,0,0,0.5)",
    indigo: '#3023AE',
    purplePink: '#C86DD7',
    chat: '#0077FF',
    chatBg: '#3a9aff',
    textPayment: '#50E3C2',
    bgPayment: '#40CEA5',
    success: '#57DC89',
    textBad: '#F96F6F',
    settings: '#50A2FF',
    helpDesk: '#57CD89',
    inviteFriends: '#59FF42',
    legal: '#F9CC6F',
    logOut: '#7E8996',
    white: '#ffffff',
    blueLink: '#007AFF'
  },
  fontSize: {
    standard: 16,
    small: 13,
    large: 20,
    larger: 24
  },
  fontFamily: {
    medium: 'Avenir-Medium',
    heavy: 'Avenir-Heavy',
    black: 'Avenir-Black',
    din: 'DIN-Alternate-Bold'
  },
  radius: {
    small: 5,
    standard: 9,
    big: 18,
    extraBig: 25
  }
}


// Screen size utilities
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const screenSize = {
  width: screenWidth,
  height: screenHeight,
  isSmall: screenWidth < 375, // iPhone SE, small Android devices
  isMedium: screenWidth >= 375 && screenWidth < 768, // Standard phones
  isLarge: screenWidth >= 768 && screenWidth < 1024, // Tablets
  isExtraLarge: screenWidth >= 1024, // Large tablets/desktop
  isSmallHeight: screenHeight < 667, // iPhone SE height
  isMediumHeight: screenHeight >= 667 && screenHeight < 812, // Standard phone height
  isLargeHeight: screenHeight >= 812, // Tall phones
} as const;


// postgresql data standardization
const selectLocation = 'id, name, timezone' as const;
export interface Location {
  id: string,
  name: string,
  timezone: string
}

const selectVenue = 'id, banner, avatar, name, type, address, cost, location, description, neighborhood, supportEmail, salesTax, stripeConnectAccountId, stripeAccountStatus, hasOnboarded, status' as const;
export interface Venue {
  id: string
  banner: string
  avatar: string
  name: string
  type: string
  address: string
  cost: number
  location: string
  description: string
  neighborhood: string
  supportEmail: string
  salesTax: number
  stripeConnectAccountId: string | null
  stripeAccountStatus: string
  hasOnboarded: boolean
  status: boolean
}

const selectListing = 'id, name, maxInventory, currInventory, price, description, minPerOrder, maxPerOrder, purchasePolicy, event, collectInPerson, heldInventory, soldInventory, type, custom, customForUser, customExpiry, peoplePerListing, refundTimeLimit, listingEndTime, listingStartTime, orderConfirmation, orderFee, taxOption, taxValue, gratuityOption, gratuityValue, markSold, hasMin' as const;
export interface Listing {
  id: string
  name: string
  maxInventory: number
  currInventory: number
  price: number
  description: string | null
  minPerOrder: number
  maxPerOrder: number | null
  purchasePolicy: string
  event: string
  collectInPerson: boolean
  heldInventory: number
  soldInventory: number
  type: number
  custom: boolean
  customForUser: string | null
  customExpiry: string | null
  peoplePerListing: number | null,
  refundTimeLimit: string,
  listingEndTime: string,
  listingStartTime: string,
  orderConfirmation: 'auto' | 'confirm',
  orderFee: 'buyer' | 'cover',
  taxOption: 'venue' | 'checkout' | 'exempt' | 'none',
  taxValue: number,
  gratuityOption: 'venue' | 'checkout' | 'included' | 'none',
  gratuityValue: number,
  markSold: boolean,
  hasMin: boolean
}

const selectEvent = `id, flyer, name, description, start, end, performer, allowOffers, venue(${selectVenue}), listings(${selectListing}), linkedRepeat` as const;
export interface Event {
  id: string
  flyer: string | null
  name: string
  description: string
  start: string
  end: string
  performer: string
  allowOffers: boolean
  venue: Venue,
  listings: Listing[],
  linkedRepeat: string | null
}

const selectEventMinimal = `id, flyer, name, description, start, end, performer, allowOffers, linkedRepeat, status` as const;
export interface EventMinimal {
  id: string
  flyer: string | null
  name: string
  description: string
  start: string
  end: string
  performer: string
  allowOffers: boolean,
  linkedRepeat: string,
  status: 'live' | 'past' | 'suspended' | 'cancelled' | 'draft'
}

const selectOrderListing = `id, listing(${selectListing}), quantity` as const;
export interface OrderListing {
  id: string,
  listing: Listing,
  quantity: number,
}

const selectOrder = `id, event(${selectEventMinimal}), venue(${selectVenue}), order_listings(${selectOrderListing}), state, maxToCheckIn, currCheckedIn, checkedIn, orderStatus` as const;
export interface Order {
  id: string,
  event: EventMinimal,
  venue: Venue,
  order_listings: OrderListing[],
  state: number,
  maxToCheckIn: number | null,
  currCheckedIn: number,
  checkedIn: boolean,
  orderStatus: 'checkout' | 'confirmed' | 'pending' | 'declined' | 'canceled' | 'stale' | 'refunded' | null
}

export interface CartItem {
  listing: Listing,
  quantity: number
}

export interface UserInfo {
  id: string,
  firstName: string | null,
  lastName: string | null,
  phoneNumber: string,
  email: string | null,
  dateOfBirth: string | null,
  stripeCustomerID: string,
}

export interface PaymentMethod {
  id: string,
  user_id: string,
  stripe_payment_method_id: string,
  type: string,
  brand: string | null,
  last4: string | null,
  exp_month: number | null,
  exp_year: number | null,
  is_default: boolean,
  created_at: string,
  updated_at: string
}

export interface Cost {
  subtotal: number,
  bottleUpFees: number,
  stripeFees: number,
  salesTax: number,
  gratuity: number,
  total: number,
  totalFees: number,
  payableAtVenue: number,
  dueNow: number
}


export const select = {
  location: selectLocation,
  venue: selectVenue,
  listing: selectListing,
  event: selectEvent,
  order: selectOrder,
} as const;


export const useStore = create<{
  events: Event[],
  setEvents: (newEvents: Event[]) => void,
  updateSingleEvent: (event: Event) => void,
  setEventListings: (eventID: string, listings: Listing[]) => void,
  userLocation: Location | null,
  setUserLocation: (newLocation: Location) => void,
  userTimezone: string,
  setUserTimezone: (timezone: string) => void,
  locations: Location[],
  setLocations: (newLocations: Location[]) => void,
  venues: Venue[],
  setVenues: (newVenues: Venue[]) => void,
  userOrders: Order[],
  setUserOrders: (newUserOrders: Order[]) => void,
  setSingleUserOrder: (newUserOrder: Order) => void,
  refundTriggered: boolean
  setRefundTriggered: (refundTriggered: boolean) => void
}>()(
  devtools(
    persist(
      set => ({
        events: [],
        setEvents: newEvents => set(() => ({ events: newEvents })),
        updateSingleEvent: event => set(state => ({ events: state.events.filter(d => d.id !== event.id).concat(event) })),
        setEventListings: (eventID, listings) => set(state => {
          const eventsCopy = [...state.events];
          const event = eventsCopy.find(d => d.id === eventID)!;
          event.listings = listings;
          return ({ events: eventsCopy });
        }),

        userLocation: null,
        setUserLocation: newLocation => set(() => ({ userLocation: newLocation })),

        userTimezone: '',
        setUserTimezone: timezone => set(() => ({ userTimezone: timezone })),

        locations: [],
        setLocations: newLocations => set(() => ({ locations: newLocations })),

        venues: [],
        setVenues: newVenues => set(() => ({ venues: newVenues })),

        userOrders: [],
        setUserOrders: (newUserOrders: Order[]) => set(() => ({ userOrders: newUserOrders })),
        setSingleUserOrder: (newUserOrder: Order) => set(({ userOrders }) => ({ userOrders: [...userOrders.filter(d => d.id !== newUserOrder.id), newUserOrder] })),

        refundTriggered: false,
        setRefundTriggered: (refundTriggered: boolean) => set({ refundTriggered })
      }),
      {
        name: "user-app",
        storage: createJSONStorage(() => AsyncStorage)
      }
    )
  )
);


export const usePurchaseStore = create<{
  eventID: string,
  setEventID: (eventID: string) => void,
  orderID: string | null,
  setOrderID: (newOrderID: string) => void,
  clearOrderID: () => void,
  orderAge: Date | null,
  cart: CartItem[],
  updateCart: (newCart: CartItem[]) => void
}>()(
  devtools(
    set => ({
      eventID: '',
      setEventID: eventID => set(() => ({ eventID })),

      orderID: null,
      orderAge: null,
      setOrderID: newOrderID => set(() => ({ orderID: newOrderID, orderAge: new Date() })),
      clearOrderID: () => set(() => ({ orderID: null, orderAge: null })),

      cart: [],
      updateCart: newCart => set({ cart: newCart })
    })
  )
)


export type AuthRole = 'user' | 'vendor' | 'super-admin'
export type AuthFlowRole = 'login' | 'signup' | 'forgot' | 'settings'

export const useAuthFlowStore = create<{
  phoneNumber: string | null,
  email: string | null,
  role: AuthRole | null,
  userId: string | null,
  flowRole: AuthFlowRole | null,
  verifiedOTP: string | null,
  setPhoneNumber: (newPhoneNumber: string) => void,
  setEmail: (newEmail: string) => void,
  setRole: (role: AuthRole | null) => void,
  setUserId: (userId: string) => void,
  setFlowRole: (flowRole: AuthFlowRole | null) => void,
  setVerifiedOTP: (otp: string | null) => void,
}>()(
  devtools(
    set => ({
      phoneNumber: null,
      email: null,
      role: null,
      userId: null,
      flowRole: null,
      verifiedOTP: null,
      setPhoneNumber: newPhoneNumber => set({ phoneNumber: newPhoneNumber }),
      setEmail: newEmail => set({ email: newEmail }),
      setRole: role => set({ role }),
      setUserId: userId => set({ userId }),
      setFlowRole: flowRole => set({ flowRole }),
      setVerifiedOTP: otp => set({ verifiedOTP: otp })
    })
  ),
)


export const useAuthStore = create<{
  signedIn: boolean,
  userInfo: UserInfo | null,
  signIn: (newUserInfo: UserInfo) => void,
  signOut: () => void
}>()(
  persist(
    devtools(
      set => ({
        signedIn: false,
        userInfo: null,
        signIn: newUserInfo => set({ signedIn: true, userInfo: newUserInfo }),
        signOut: async () => {
          // Sign out from Supabase
          await supabase.auth.signOut();
          set({ signedIn: false, userInfo: null });
        }
      })
    ),
    {
      name: "user-app-auth",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
)