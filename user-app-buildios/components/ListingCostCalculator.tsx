export interface OrderListing {
  listing: {
    price: number;
    collectInPerson: boolean;
    listingEndTime: string;
    taxOption: 'venue' | 'checkout' | 'exempt' | 'none';
    taxValue: number;
    gratuityOption: 'venue' | 'checkout' | 'included' | 'none';
    gratuityValue: number;
    orderFee: 'buyer' | 'cover';
  };
  quantity: number;
}

export interface OrderCostBreakdown {
  subtotal: number;
  bottleUpFees: number;
  stripeFees: number;
  salesTax: number;
  gratuity: number;
  payableAtVenue: number;
  dueNow: number;
  total: number;
  totalFees: number;
}

export const calculateOrderCost = (orderListing: OrderListing): OrderCostBreakdown => {
  // calculate cost of everything listed with the order
  let subtotal = 0; //total price of listing selected multipled by quantity (does not included fees)
  let bottleUpFees = 0; //bottle up fee (2.1% + $0.69) on subtotal plus tax and gratuity
  let stripeFees = 0; //stripe fee (2.9% + $0.30) on subtotal plus tax and gratuity
  let payableAtVenue = 0; //total in person price of listings times quantity plus tax/gratuity
  let dueNow = 0; //payment amount due now that is paid in stripe
  let salesTax = 0; //sales tax for the venue, calculated on subtotal plus gratuity
  let gratuity = 0; //gratuity for the venue, calculated on subtotal
  
  // price is price*quantity rounded to nearest cents
  const price = Math.round(orderListing.listing.price * orderListing.quantity);
  subtotal += price;

  let gratuityValue = orderListing.listing.gratuityValue; // Already stored as decimal (0.06)
  let salesTaxValue = orderListing.listing.taxValue; // Already stored as decimal (0.06)

  // if collect in person, price is added to payable at venue
  if(orderListing.listing.collectInPerson) {
    payableAtVenue += price;
    gratuity = orderListing.listing.gratuityOption === 'venue' ?  Math.round(payableAtVenue * gratuityValue) : 0;
    salesTax = orderListing.listing.taxOption === 'venue' ?  Math.round((payableAtVenue + gratuity) * salesTaxValue) : 0;
    payableAtVenue += gratuity + salesTax;

    bottleUpFees = Math.round(payableAtVenue * 0.021) + 69;
    // stripeFees = Math.round(bottleUpFees * 0.029) + 30;
    dueNow += bottleUpFees;
  }
  // otherwise, we collect in app
  else {

    dueNow += subtotal;
    gratuity = orderListing.listing.gratuityOption === 'checkout' ?  Math.round(subtotal * gratuityValue) : 0;
    salesTax = orderListing.listing.taxOption === 'checkout' ?  Math.round((subtotal + gratuity) * salesTaxValue) : 0;
    dueNow += (gratuity + salesTax)

    if(orderListing.listing.orderFee === 'cover'){
      stripeFees = Math.round(dueNow * 0.029) + 30;
      subtotal -= stripeFees;
      bottleUpFees = Math.round((dueNow - stripeFees) * 0.021) + 69;
      subtotal -= bottleUpFees;
    }
    else{
      // Calculate BottleUp fee on total subtotal (2.1% + $0.69)
      bottleUpFees = Math.round(dueNow * 0.021) + 69;
      // Calculate what customer should pay BEFORE Stripe fee (items + tax + BottleUp fee)
      dueNow += bottleUpFees;				
    }
  }

  if(orderListing.listing.orderFee === 'buyer'){
    // Calculate initial Stripe fee on the amount before Stripe fee
    const initialStripeFee = orderListing.listing.collectInPerson ? Math.round(bottleUpFees * 0.029) + 30 : Math.round(dueNow * 0.029) + 30;					
    // Add them together to get the total that will be charged
    dueNow = dueNow + initialStripeFee;				
    // Now calculate the ACTUAL Stripe fee on the total that will be charged
    const realStripeFee = Math.round(dueNow * 0.029) + 30;					
    // Calculate the difference and add it to the total
    const feeDifference = realStripeFee - initialStripeFee;
    stripeFees = realStripeFee;					
    // Final total: total to be charged + difference
    dueNow = dueNow + feeDifference;
  }

  const total = subtotal + bottleUpFees + stripeFees + salesTax + gratuity;
  const totalFees = bottleUpFees + stripeFees;

  return {
    subtotal,
    bottleUpFees,
    stripeFees,
    salesTax,
    gratuity,
    payableAtVenue,
    dueNow,
    total,
    totalFees
  };
};
