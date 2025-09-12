function BookingPanel() {
  return (
    <div className="booking-panel">
      <h2>Plan Your Adventure</h2>
      <form className="booking-form">
        <select>
          <option value="">Select Category</option>
          <option value="jeep-safari">Jeep Safari</option>
          <option value="catamaran-boat">Catamaran Boat Ride</option>
          <option value="bullock-cart">Bullock Cart Ride</option>
          <option value="village-lunch">Traditional Village Lunch</option>
          <option value="tuk-tuk">Tuk Tuk Ride</option>
        </select>
        <input type="date" min={new Date().toISOString().split('T')[0]} />
        <input type="text" placeholder="Location" />
        <button type="submit">Search Adventures</button>
      </form>
    </div>
  );
}

export default BookingPanel;