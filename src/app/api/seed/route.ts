import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if data already exists
    const existingUsers = await db.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({ message: 'Data already seeded', count: existingUsers });
    }

    // Create categories
    const categories = await Promise.all([
      db.category.create({ data: { name: 'Event Organizer', slug: 'event-organizer', icon: 'PartyPopper', description: 'Full event organization and management services' } }),
      db.category.create({ data: { name: 'Event Planner', slug: 'event-planner', icon: 'ClipboardList', description: 'Professional event planning and coordination' } }),
      db.category.create({ data: { name: 'Caterers', slug: 'caterers', icon: 'UtensilsCrossed', description: 'Food and beverage catering services' } }),
      db.category.create({ data: { name: 'Cameraman', slug: 'cameraman', icon: 'Camera', description: 'Photography and videography services' } }),
      db.category.create({ data: { name: 'Decorators', slug: 'decorators', icon: 'Palette', description: 'Event decoration and styling services' } }),
      db.category.create({ data: { name: 'DJ & Music', slug: 'dj-music', icon: 'Music', description: 'Music and entertainment services' } }),
      db.category.create({ data: { name: 'Venue Rental', slug: 'venue-rental', icon: 'Building2', description: 'Event venues and spaces for rent' } }),
      db.category.create({ data: { name: 'Makeup & Styling', slug: 'makeup-styling', icon: 'Sparkles', description: 'Bridal and event makeup services' } }),
    ]);

    // Create customer users
    const customers = await Promise.all([
      db.user.create({ data: { name: 'Priya Sharma', email: 'priya@example.com', phone: '+91-9876543210', password: 'hashed_password_1', role: 'customer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' } }),
      db.user.create({ data: { name: 'Rahul Verma', email: 'rahul@example.com', phone: '+91-9876543211', password: 'hashed_password_2', role: 'customer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' } }),
      db.user.create({ data: { name: 'Anita Desai', email: 'anita@example.com', phone: '+91-9876543212', password: 'hashed_password_3', role: 'customer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita' } }),
    ]);

    // Create organizer users
    const organizerUsers = await Promise.all([
      db.user.create({ data: { name: 'Vikram Patel', email: 'vikram@eventpro.com', phone: '+91-9876543220', password: 'hashed_password_4', role: 'organizer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' } }),
      db.user.create({ data: { name: 'Sneha Reddy', email: 'sneha@celebrations.com', phone: '+91-9876543221', password: 'hashed_password_5', role: 'organizer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha' } }),
      db.user.create({ data: { name: 'Arjun Kapoor', email: 'arjun@weddingwonders.com', phone: '+91-9876543222', password: 'hashed_password_6', role: 'organizer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun' } }),
      db.user.create({ data: { name: 'Meera Iyer', email: 'meera@framecraft.com', phone: '+91-9876543223', password: 'hashed_password_7', role: 'organizer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera' } }),
      db.user.create({ data: { name: 'Rohan Singh', email: 'rohan@feastmasters.com', phone: '+91-9876543224', password: 'hashed_password_8', role: 'organizer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' } }),
      db.user.create({ data: { name: 'Kavya Nair', email: 'kavya@groovebeats.com', phone: '+91-9876543225', password: 'hashed_password_9', role: 'organizer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya' } }),
    ]);

    // Create organizer profiles
    const organizerProfiles = await Promise.all([
      db.organizerProfile.create({ data: { userId: organizerUsers[0].id, companyName: 'EventPro Solutions', description: 'Premium event organization company specializing in corporate events, weddings, and grand celebrations. Over 10 years of experience creating unforgettable moments.', address: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', rating: 4.8, reviewCount: 156, isVerified: true, isAvailable: true, experience: 10, logo: 'https://api.dicebear.com/7.x/initials/svg?seed=EP&backgroundColor=8B1A2B', coverImage: 'https://picsum.photos/seed/event1/800/400' } }),
      db.organizerProfile.create({ data: { userId: organizerUsers[1].id, companyName: 'Celebrations Hub', description: 'Your one-stop destination for all celebration needs. From intimate gatherings to grand galas, we make every event special with attention to detail and creative flair.', address: '456 Brigade Road', city: 'Bangalore', state: 'Karnataka', rating: 4.6, reviewCount: 98, isVerified: true, isAvailable: true, experience: 7, logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CH&backgroundColor=8B1A2B', coverImage: 'https://picsum.photos/seed/event2/800/400' } }),
      db.organizerProfile.create({ data: { userId: organizerUsers[2].id, companyName: 'Wedding Wonders', description: 'Creating dream weddings that tell your unique love story. Specialized in traditional and contemporary wedding ceremonies with a touch of magic.', address: '789 Park Street', city: 'Delhi', state: 'Delhi', rating: 4.9, reviewCount: 234, isVerified: true, isAvailable: true, experience: 12, logo: 'https://api.dicebear.com/7.x/initials/svg?seed=WW&backgroundColor=8B1A2B', coverImage: 'https://picsum.photos/seed/event3/800/400' } }),
      db.organizerProfile.create({ data: { userId: organizerUsers[3].id, companyName: 'FrameCraft Studios', description: 'Professional photography and videography services for all occasions. We capture moments that become timeless memories with cinematic quality.', address: '321 Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', rating: 4.7, reviewCount: 189, isVerified: true, isAvailable: true, experience: 8, logo: 'https://api.dicebear.com/7.x/initials/svg?seed=FC&backgroundColor=8B1A2B', coverImage: 'https://picsum.photos/seed/event4/800/400' } }),
      db.organizerProfile.create({ data: { userId: organizerUsers[4].id, companyName: 'Feast Masters', description: 'Exquisite catering services for weddings, corporate events, and private parties. Our chefs craft culinary masterpieces that delight every palate.', address: '654 Salt Lake', city: 'Kolkata', state: 'West Bengal', rating: 4.5, reviewCount: 112, isVerified: true, isAvailable: true, experience: 6, logo: 'https://api.dicebear.com/7.x/initials/svg?seed=FM&backgroundColor=8B1A2B', coverImage: 'https://picsum.photos/seed/event5/800/400' } }),
      db.organizerProfile.create({ data: { userId: organizerUsers[5].id, companyName: 'Groove Beats Entertainment', description: 'Premium DJ and music entertainment services. From Bollywood beats to international tracks, we set the perfect mood for your celebration.', address: '987 Banjara Hills', city: 'Hyderabad', state: 'Telangana', rating: 4.4, reviewCount: 87, isVerified: true, isAvailable: true, experience: 5, logo: 'https://api.dicebear.com/7.x/initials/svg?seed=GB&backgroundColor=8B1A2B', coverImage: 'https://picsum.photos/seed/event6/800/400' } }),
    ]);

    // Create services
    const services = await Promise.all([
      // EventPro Solutions services
      db.service.create({ data: { organizerId: organizerProfiles[0].id, categoryId: categories[0].id, title: 'Corporate Event Package', description: 'Complete corporate event management including venue setup, stage decoration, sound system, and coordination. Perfect for conferences, award ceremonies, and product launches.', price: 75000, priceType: 'fixed', images: '["https://picsum.photos/seed/corp1/600/400","https://picsum.photos/seed/corp2/600/400","https://picsum.photos/seed/corp3/600/400"]', duration: '8 hours', maxGuests: 500, rating: 4.8, reviewCount: 45, isActive: true } }),
      db.service.create({ data: { organizerId: organizerProfiles[0].id, categoryId: categories[0].id, title: 'Grand Wedding Package', description: 'Full-service wedding organization covering ceremony setup, reception, catering coordination, and entertainment management. We handle everything from start to finish.', price: 250000, priceType: 'fixed', images: '["https://picsum.photos/seed/wed1/600/400","https://picsum.photos/seed/wed2/600/400","https://picsum.photos/seed/wed3/600/400"]', duration: '2 days', maxGuests: 1000, rating: 4.9, reviewCount: 67, isActive: true } }),
      db.service.create({ data: { organizerId: organizerProfiles[0].id, categoryId: categories[1].id, title: 'Birthday Party Planning', description: 'Fun and creative birthday party planning for all ages. Themes, decorations, games, and entertainment all included.', price: 25000, priceType: 'fixed', images: '["https://picsum.photos/seed/bday1/600/400","https://picsum.photos/seed/bday2/600/400"]', duration: '4 hours', maxGuests: 100, rating: 4.6, reviewCount: 34, isActive: true } }),

      // Celebrations Hub services
      db.service.create({ data: { organizerId: organizerProfiles[1].id, categoryId: categories[0].id, title: 'Engagement Ceremony', description: 'Beautiful engagement ceremony organization with stage decoration, flower arrangements, music, and photography coordination.', price: 85000, priceType: 'fixed', images: '["https://picsum.photos/seed/engage1/600/400","https://picsum.photos/seed/engage2/600/400"]', duration: '6 hours', maxGuests: 300, rating: 4.7, reviewCount: 29, isActive: true } }),
      db.service.create({ data: { organizerId: organizerProfiles[1].id, categoryId: categories[1].id, title: 'Festival Event Planning', description: 'Organize cultural festivals and community events with traditional decorations, performances, and food stalls.', price: 150000, priceType: 'fixed', images: '["https://picsum.photos/seed/fest1/600/400","https://picsum.photos/seed/fest2/600/400","https://picsum.photos/seed/fest3/600/400"]', duration: '2 days', maxGuests: 2000, rating: 4.5, reviewCount: 18, isActive: true } }),

      // Wedding Wonders services
      db.service.create({ data: { organizerId: organizerProfiles[2].id, categoryId: categories[0].id, title: 'Royal Wedding Experience', description: 'An exquisite royal-themed wedding with palatial decorations, mandap setup, ceremonial coordination, and premium vendor management.', price: 500000, priceType: 'fixed', images: '["https://picsum.photos/seed/royal1/600/400","https://picsum.photos/seed/royal2/600/400","https://picsum.photos/seed/royal3/600/400"]', duration: '3 days', maxGuests: 1500, rating: 5.0, reviewCount: 89, isActive: true } }),
      db.service.create({ data: { organizerId: organizerProfiles[2].id, categoryId: categories[0].id, title: 'Intimate Wedding Package', description: 'Perfect for small, intimate wedding ceremonies with elegant decoration, essential coordination, and a personal touch.', price: 120000, priceType: 'fixed', images: '["https://picsum.photos/seed/intimate1/600/400","https://picsum.photos/seed/intimate2/600/400"]', duration: '1 day', maxGuests: 100, rating: 4.8, reviewCount: 42, isActive: true } }),

      // FrameCraft Studios services
      db.service.create({ data: { organizerId: organizerProfiles[3].id, categoryId: categories[3].id, title: 'Wedding Photography Package', description: 'Complete wedding photography coverage with pre-wedding shoot, ceremony photos, and cinematic video. Includes 500+ edited photos and a highlight reel.', price: 80000, priceType: 'fixed', images: '["https://picsum.photos/seed/photo1/600/400","https://picsum.photos/seed/photo2/600/400","https://picsum.photos/seed/photo3/600/400"]', duration: '2 days', maxGuests: 0, rating: 4.9, reviewCount: 78, isActive: true } }),
      db.service.create({ data: { organizerId: organizerProfiles[3].id, categoryId: categories[3].id, title: 'Event Videography', description: 'Professional event videography with drone shots, multi-camera setup, and cinematic editing. Perfect for corporate events and celebrations.', price: 45000, priceType: 'fixed', images: '["https://picsum.photos/seed/video1/600/400","https://picsum.photos/seed/video2/600/400"]', duration: '8 hours', maxGuests: 0, rating: 4.6, reviewCount: 35, isActive: true } }),
      db.service.create({ data: { organizerId: organizerProfiles[3].id, categoryId: categories[3].id, title: 'Pre-Wedding Shoot', description: 'Creative pre-wedding photography at stunning locations. Includes 100+ edited photos with artistic and candid styles.', price: 35000, priceType: 'fixed', images: '["https://picsum.photos/seed/prewed1/600/400","https://picsum.photos/seed/prewed2/600/400"]', duration: '6 hours', maxGuests: 0, rating: 4.8, reviewCount: 56, isActive: true } }),

      // Feast Masters services
      db.service.create({ data: { organizerId: organizerProfiles[4].id, categoryId: categories[2].id, title: 'Premium Wedding Catering', description: 'Exquisite multi-cuisine wedding catering with live counters, dessert stations, and custom menu planning. Vegetarian and non-vegetarian options available.', price: 1500, priceType: 'per_person', images: '["https://picsum.photos/seed/cater1/600/400","https://picsum.photos/seed/cater2/600/400","https://picsum.photos/seed/cater3/600/400"]', duration: 'Full day', maxGuests: 1000, rating: 4.7, reviewCount: 45, isActive: true } }),
      db.service.create({ data: { organizerId: organizerProfiles[4].id, categoryId: categories[2].id, title: 'Corporate Buffet Catering', description: 'Professional buffet catering for corporate events with continental, Indian, and Asian options. Includes setup and service staff.', price: 800, priceType: 'per_person', images: '["https://picsum.photos/seed/buffet1/600/400","https://picsum.photos/seed/buffet2/600/400"]', duration: '4 hours', maxGuests: 500, rating: 4.4, reviewCount: 28, isActive: true } }),

      // Groove Beats services
      db.service.create({ data: { organizerId: organizerProfiles[5].id, categoryId: categories[5].id, title: 'DJ & Sound System', description: 'Professional DJ services with premium sound system, lighting effects, and smoke machines. Bollywood, EDM, and international music.', price: 30000, priceType: 'fixed', images: '["https://picsum.photos/seed/dj1/600/400","https://picsum.photos/seed/dj2/600/400"]', duration: '6 hours', maxGuests: 500, rating: 4.5, reviewCount: 32, isActive: true } }),
      db.service.create({ data: { organizerId: organizerProfiles[5].id, categoryId: categories[5].id, title: 'Live Band Performance', description: 'Energetic live band performances for weddings and events. Covers Bollywood hits, retro classics, and contemporary hits.', price: 60000, priceType: 'fixed', images: '["https://picsum.photos/seed/band1/600/400","https://picsum.photos/seed/band2/600/400"]', duration: '4 hours', maxGuests: 300, rating: 4.6, reviewCount: 19, isActive: true } }),

      // Additional services for variety
      db.service.create({ data: { organizerId: organizerProfiles[2].id, categoryId: categories[4].id, title: 'Wedding Decoration Premium', description: 'Luxury wedding decoration with floral arrangements, lighting, mandap decoration, and entrance styling. Transform any venue into a fairy tale setting.', price: 180000, priceType: 'fixed', images: '["https://picsum.photos/seed/decor1/600/400","https://picsum.photos/seed/decor2/600/400","https://picsum.photos/seed/decor3/600/400"]', duration: '2 days', maxGuests: 0, rating: 4.9, reviewCount: 63, isActive: true } }),
      db.service.create({ data: { organizerId: organizerProfiles[0].id, categoryId: categories[6].id, title: 'Banquet Hall Rental', description: 'Elegant banquet hall with capacity for 300 guests. Includes basic setup, air conditioning, parking, and power backup.', price: 45000, priceType: 'fixed', images: '["https://picsum.photos/seed/venue1/600/400","https://picsum.photos/seed/venue2/600/400"]', duration: '8 hours', maxGuests: 300, rating: 4.3, reviewCount: 22, isActive: true } }),
      db.service.create({ data: { organizerId: organizerProfiles[1].id, categoryId: categories[7].id, title: 'Bridal Makeup Package', description: 'Complete bridal makeup with hairstyling, draping assistance, and touch-ups. Uses premium international brands for a flawless look.', price: 25000, priceType: 'fixed', images: '["https://picsum.photos/seed/makeup1/600/400","https://picsum.photos/seed/makeup2/600/400"]', duration: '4 hours', maxGuests: 1, rating: 4.7, reviewCount: 41, isActive: true } }),
    ]);

    // Create bookings
    const now = new Date();
    const bookings = await Promise.all([
      db.booking.create({ data: { customerId: customers[0].id, serviceId: services[1].id, status: 'completed', eventDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), eventTime: '18:00', guestCount: 500, notes: 'Traditional wedding ceremony', totalAmount: 250000, advancePaid: 100000, createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.booking.create({ data: { customerId: customers[0].id, serviceId: services[7].id, status: 'ongoing', eventDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), eventTime: '10:00', guestCount: 200, notes: 'Sangeet ceremony photography', totalAmount: 80000, advancePaid: 40000, createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.booking.create({ data: { customerId: customers[1].id, serviceId: services[0].id, status: 'accepted', eventDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), eventTime: '09:00', guestCount: 300, notes: 'Annual company conference', totalAmount: 75000, advancePaid: 37500, createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.booking.create({ data: { customerId: customers[1].id, serviceId: services[11].id, status: 'pending', eventDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(), eventTime: '19:00', guestCount: 150, notes: 'Corporate dinner event', totalAmount: 120000, advancePaid: 0, createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.booking.create({ data: { customerId: customers[2].id, serviceId: services[5].id, status: 'completed', eventDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(), eventTime: '16:00', guestCount: 800, notes: 'Royal wedding ceremony', totalAmount: 500000, advancePaid: 200000, createdAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.booking.create({ data: { customerId: customers[2].id, serviceId: services[13].id, status: 'accepted', eventDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), eventTime: '20:00', guestCount: 250, notes: 'Wedding reception DJ', totalAmount: 30000, advancePaid: 15000, createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.booking.create({ data: { customerId: customers[0].id, serviceId: services[9].id, status: 'rejected', eventDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), eventTime: '08:00', notes: 'Event videography needed', totalAmount: 45000, advancePaid: 0, createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() } }),
    ]);

    // Create payments
    await Promise.all([
      db.payment.create({ data: { bookingId: bookings[0].id, customerId: customers[0].id, amount: 100000, method: 'upi', status: 'completed', transactionId: 'TXN001', createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.payment.create({ data: { bookingId: bookings[0].id, customerId: customers[0].id, amount: 150000, method: 'card', status: 'completed', transactionId: 'TXN002', createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.payment.create({ data: { bookingId: bookings[1].id, customerId: customers[0].id, amount: 40000, method: 'netbanking', status: 'completed', transactionId: 'TXN003', createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.payment.create({ data: { bookingId: bookings[2].id, customerId: customers[1].id, amount: 37500, method: 'upi', status: 'completed', transactionId: 'TXN004', createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.payment.create({ data: { bookingId: bookings[4].id, customerId: customers[2].id, amount: 200000, method: 'card', status: 'completed', transactionId: 'TXN005', createdAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.payment.create({ data: { bookingId: bookings[4].id, customerId: customers[2].id, amount: 300000, method: 'netbanking', status: 'completed', transactionId: 'TXN006', createdAt: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.payment.create({ data: { bookingId: bookings[5].id, customerId: customers[2].id, amount: 15000, method: 'wallet', status: 'completed', transactionId: 'TXN007', createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() } }),
    ]);

    // Create reviews
    await Promise.all([
      db.review.create({ data: { bookingId: bookings[0].id, userId: customers[0].id, rating: 5, comment: 'Absolutely amazing! The wedding was organized perfectly. Every detail was taken care of and the team was extremely professional.', images: '["https://picsum.photos/seed/rev1/400/300"]', createdAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString() } }),
      db.review.create({ data: { bookingId: bookings[4].id, userId: customers[2].id, rating: 5, comment: 'The royal wedding experience was beyond our expectations. Every moment felt magical. Highly recommend Wedding Wonders!', images: '["https://picsum.photos/seed/rev2/400/300","https://picsum.photos/seed/rev3/400/300"]', createdAt: new Date(now.getTime() - 58 * 24 * 60 * 60 * 1000).toISOString() } }),
    ]);

    // Create favorites
    await Promise.all([
      db.favorite.create({ data: { userId: customers[0].id, serviceId: services[5].id } }),
      db.favorite.create({ data: { userId: customers[0].id, serviceId: services[9].id } }),
      db.favorite.create({ data: { userId: customers[1].id, serviceId: services[1].id } }),
      db.favorite.create({ data: { userId: customers[2].id, serviceId: services[13].id } }),
    ]);

    // Create earnings
    await Promise.all([
      db.earning.create({ data: { organizerId: organizerProfiles[0].id, bookingId: bookings[0].id, amount: 250000, type: 'booking', status: 'available' } }),
      db.earning.create({ data: { organizerId: organizerProfiles[3].id, bookingId: bookings[1].id, amount: 80000, type: 'booking', status: 'available' } }),
      db.earning.create({ data: { organizerId: organizerProfiles[0].id, bookingId: bookings[2].id, amount: 75000, type: 'booking', status: 'pending' } }),
      db.earning.create({ data: { organizerId: organizerProfiles[2].id, bookingId: bookings[4].id, amount: 500000, type: 'booking', status: 'available' } }),
      db.earning.create({ data: { organizerId: organizerProfiles[5].id, bookingId: bookings[5].id, amount: 30000, type: 'booking', status: 'pending' } }),
      db.earning.create({ data: { organizerId: organizerProfiles[0].id, amount: 100000, type: 'withdrawal', status: 'withdrawn' } }),
      db.earning.create({ data: { organizerId: organizerProfiles[2].id, amount: 200000, type: 'withdrawal', status: 'withdrawn' } }),
    ]);

    // Create notifications
    await Promise.all([
      db.notification.create({ data: { userId: customers[0].id, title: 'Booking Confirmed', message: 'Your wedding photography booking with FrameCraft Studios has been accepted!', type: 'booking', isRead: false } }),
      db.notification.create({ data: { userId: customers[0].id, title: 'Payment Successful', message: 'Payment of ₹40,000 has been processed successfully.', type: 'payment', isRead: false } }),
      db.notification.create({ data: { userId: customers[1].id, title: 'Booking Request Sent', message: 'Your booking request for Corporate Event Package has been sent to EventPro Solutions.', type: 'booking', isRead: true } }),
      db.notification.create({ data: { userId: customers[2].id, title: 'Special Offer!', message: 'Get 15% off on all wedding services this season. Use code WEDDING15.', type: 'promotion', isRead: false } }),
      db.notification.create({ data: { userId: organizerUsers[0].id, title: 'New Booking Request', message: 'Rahul Verma has requested a corporate event booking.', type: 'booking', isRead: false } }),
      db.notification.create({ data: { userId: organizerUsers[3].id, title: 'Payment Received', message: '₹40,000 has been received for wedding photography booking.', type: 'payment', isRead: false } }),
    ]);

    // Create admin user
    await db.user.create({ data: { name: 'Admin User', email: 'admin@eventmarket.com', phone: '+91-9876543200', password: 'hashed_admin_password', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' } });

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      categories: categories.length,
      users: customers.length + organizerUsers.length + 1,
      organizerProfiles: organizerProfiles.length,
      services: services.length,
      bookings: bookings.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 });
  }
}
