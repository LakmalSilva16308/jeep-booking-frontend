function Testimonial() {
  const testimonials = [
    { name: 'John Doe', text: 'Amazing jeep safari experience! Highly recommend!', rating: 5 },
    { name: 'Jane Smith', text: 'Loved the catamaran boat ride. Beautiful views!', rating: 4 },
    { name: 'Mike Johnson', text: 'The bullock cart ride was authentic and fun.', rating: 5 },
    { name: 'Sarah Lee', text: 'Traditional village lunch was delicious and cultural.', rating: 4 },
    { name: 'Tom Brown', text: 'Tuk tuk ride through the city was thrilling!', rating: 5 },
  ];

  return (
    <section className="testimonial-section">
      <div className="container">
        <h2>What Our Customers Say</h2>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p className="italic">"{t.text}"</p>
              <div className="flex justify-between">
                <p className="name">{t.name}</p>
                <p className="rating">{'★'.repeat(t.rating)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonial;