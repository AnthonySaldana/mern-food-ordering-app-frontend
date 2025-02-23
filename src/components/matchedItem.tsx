import React from 'react';

interface MatchedItemProps {
  targetItem: any;
  selectedItem: any;
}

const MatchedItem: React.FC<MatchedItemProps> = ({ targetItem, selectedItem }) => {
//   const [quantity, setQuantity] = useState(1);

//   const handleIncrease = () => setQuantity(quantity + 1);
//   const handleDecrease = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

  const activeMatch = selectedItem; //selectedItem ? targetItem.matched_items.find((match: any) => match._id === selectedItem) : null;

  if (!selectedItem) {
    return (
      <div style={{ border: '1px solid #e5e7eb', padding: '10px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>No item selected</span>
          <div>
            <span>{targetItem.unit}</span>
            {/* <span> Total {targetItem.unit_size} {targetItem.unit_of_measurement}</span> */}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          <span>Please select a matching item</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid lightgreen', padding: '10px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* <span>{targetItem?.name}</span> */}
        <div>
          <span>{targetItem.unit}</span>
          {/* <span> Total {targetItem.unit_size} {targetItem.unit_of_measurement}</span> */}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
        <img src={activeMatch?.image} alt={selectedItem?.name} style={{ width: '50px', marginRight: '10px' }} />
        <span>{activeMatch?.name} {activeMatch?.weight}</span>
        {/* <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <button onClick={handleDecrease}>-</button>
          <span style={{ margin: '0 10px' }}>{quantity}</span>
          <button onClick={handleIncrease}>+</button>
        </div> */}
      </div>
    </div>
  );
};

export default MatchedItem;
