import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Sample users data
const sampleUsers = [
    {
        email: "farmer1@farmconnect.com",
        fullName: "Green Valley Organic Farm",
        role: "farmer",
        phone: "+91-9876543210",
        location: "Pune, Maharashtra",
        provider: "email"
    },
    {
        email: "farmer2@farmconnect.com",
        fullName: "Sunrise Fresh Produce",
        role: "farmer",
        phone: "+91-9876543211",
        location: "Nashik, Maharashtra",
        provider: "email"
    },
    {
        email: "customer1@farmconnect.com",
        fullName: "Priya Sharma",
        role: "customer",
        phone: "+91-9876543212",
        location: "Mumbai, Maharashtra",
        provider: "email"
    }
];

// Sample products data
const sampleProducts = [
    {
        name: "Fresh Organic Tomatoes",
        description: "Juicy red tomatoes grown without pesticides",
        price: 45,
        quantity: 50,
        category: "vegetables",
        farmerId: "REPLACE_WITH_FARMER_UID",
        farmerName: "Green Valley Organic Farm",
        location: "Pune, Maharashtra",
        imageUrl: "https://images.unsplash.com/photo-1546470427-e2c3d8b2e7f0?w=400",
        isAvailable: true
    },
    {
        name: "Fresh Green Lettuce",
        description: "Crispy lettuce leaves, perfect for salads",
        price: 30,
        quantity: 35,
        category: "vegetables",
        farmerId: "REPLACE_WITH_FARMER_UID",
        farmerName: "Green Valley Organic Farm",
        location: "Pune, Maharashtra",
        imageUrl: "https://images.unsplash.com/photo-1556909114-4e3b9c1c0b6d?w=400",
        isAvailable: true
    },
    {
        name: "Sweet Orange Carrots",
        description: "Crunchy carrots rich in vitamins",
        price: 40,
        quantity: 60,
        category: "vegetables",
        farmerId: "REPLACE_WITH_FARMER_UID",
        farmerName: "Sunrise Fresh Produce",
        location: "Nashik, Maharashtra",
        imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400",
        isAvailable: true
    }
];

export const addSampleUsers = async () => {
    try {
        console.log('Adding sample users...');

        for (const user of sampleUsers) {
            const docRef = await addDoc(collection(db, 'users'), {
                ...user,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Update the document with its own ID as uid
            await setDoc(doc(db, 'users', docRef.id), {
                ...user,
                uid: docRef.id,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log('User added with ID:', docRef.id);
        }

        alert('Sample users added successfully!');
    } catch (error) {
        console.error('Error adding users:', error);
        alert('Error adding users: ' + error.message);
    }
};

export const addSampleProducts = async () => {
    try {
        console.log('Adding sample products...');

        for (const product of sampleProducts) {
            await addDoc(collection(db, 'products'), {
                ...product,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        console.log('Sample products added successfully!');
        alert('Sample products added successfully!');
    } catch (error) {
        console.error('Error adding products:', error);
        alert('Error adding products: ' + error.message);
    }
};
