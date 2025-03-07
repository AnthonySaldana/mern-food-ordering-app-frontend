import React from 'react';

interface QuoteProps {
  quote: {
    time_estimate: {
      minimum: number;
      maximum: number;
      scheduled: Array<{
        id: string;
        minimum: number;
        maximum: number;
        delivery_fee: {
          delivery_fee_flat: number;
          delivery_fee_percent: number;
          delivery_fee_taxable: boolean;
        };
      }>;
    };
    sales_tax_percent: number;
    order_minimum: number;
    delivery_fee: {
      delivery_fee_flat: number;
      delivery_fee_percent: number;
      delivery_fee_taxable: boolean;
      threshold_fees: Array<any>;
    };
    service_fee: {
      service_fee_flat: number;
      service_fee_percent: number;
      service_fee_min: number;
      service_fee_max: number;
      service_fee_taxable: boolean;
    };
    small_order_fee: {
      minimum_order_value: number;
      small_order_fee_flat: number;
      small_order_fee_percent: number;
    };
    asap_available: boolean;
    first_party_quote: boolean;
    third_party_quote: boolean;
    courier_quote: boolean;
    accepts_delivery_tip: boolean;
    accepts_pickup_tip: boolean;
    accepts_pickup_note: boolean;
  };
}

const QuoteDetails: React.FC<QuoteProps> = ({ quote }) => {
    console.log(quote, 'quote in component');
  return (
    <div className="quote-details">
      <h3>Quote Details</h3>
      <p>Sales Tax: {quote?.sales_tax_percent}%</p>
      <p>Order Minimum: ${quote?.order_minimum / 100}</p>
      <p>Delivery Fee: ${quote?.delivery_fee?.delivery_fee_flat / 100}</p>
      <p>Service Fee: ${quote?.service_fee?.service_fee_flat / 100} - {quote?.service_fee?.service_fee_percent}%</p>
      <p>Small Order Fee: ${quote?.small_order_fee?.small_order_fee_flat / 100}</p>
      <p>ASAP Available: {quote?.asap_available ? 'Yes' : 'No'}</p>
      <p>Accepts Delivery Tip: {quote?.accepts_delivery_tip ? 'Yes' : 'No'}</p>
      <p>Available Delivery Time: {quote?.time_estimate?.minimum} - {quote?.time_estimate?.maximum} minutes</p>
      {quote?.time_estimate?.scheduled && quote.time_estimate.scheduled.length > 0 && (
        <div className="time-slots mt-4">
          <h4 className="font-medium mb-2">Available Scheduled Delivery Times:</h4>
          <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto">
            {quote.time_estimate.scheduled.map((slot, index) => (
              <div key={index} className="p-2 bg-[#F2F6FB] rounded-lg">
                <p className="text-sm">
                  Delivery Window: {new Date(slot.minimum * 1000).toLocaleTimeString()} - {new Date(slot.maximum * 1000).toLocaleTimeString()}
                </p>
                {slot.delivery_fee && (
                  <p className="text-xs text-gray-600">
                    Delivery Fee: ${slot.delivery_fee.delivery_fee_flat / 100}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Add more fields as needed */}
    </div>
  );
};

export default QuoteDetails;