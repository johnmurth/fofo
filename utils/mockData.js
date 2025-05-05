import { Dimensions } from 'react-native';

export const shoppingData = [
  {
    id: 1,
    itemImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlCZV9gJJPCNcoMJvkBm1dYDTRRUgClqpq4Q&s',
    description: 'Vintage Camera - Excellent Condition',
    price: 129.99,
    sellerProfile: {
      image: 'https://img.freepik.com/free-photo/black-woman-posing-with-colorful-powder_23-2149339784.jpg',
      name: 'Mary Jane'
    },
    location: 'New York, NY',
    comments: {
      count: 24,
      previewUsers: [
        'https://randomuser.me/api/portraits/women/44.jpg',
        'https://randomuser.me/api/portraits/women/68.jpg'
      ]
    }
  },
  {
    id: 2,
    itemImage: 'https://images.unsplash.com/photo-1592599457454-e6ace3370314?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YmxhY2slMjBwZW9wbGUlMjBpbiUyMGxvdmV8ZW58MHx8MHx8fDA%3D',
    description: 'Handmade Leather Journal',
    price: 45.50,
    sellerProfile: {
      image: 'https://images.pexels.com/photos/17691789/pexels-photo-17691789/free-photo-of-beautiful-girl.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      name: 'Lucy'
    },
    location: 'Los Angeles, CA',
    comments: {
      count: 56,
      previewUsers: [
        'https://randomuser.me/api/portraits/women/44.jpg',
        'https://randomuser.me/api/portraits/women/68.jpg'
      ]
    }
  },
  // Add more items as needed
];

export const data = [
    { 
      id: 1,
      profileImage: 'https://img.freepik.com/free-photo/black-woman-posing-with-colorful-powder_23-2149339784.jpg',
      profileName: 'Mary Jane',
      timestamp: '2h ago',
      label: '♫ Original Sound - Wanderlust',
      comments: {
        count: 24,
        previewUsers: [
          'https://randomuser.me/api/portraits/women/44.jpg',
          'https://randomuser.me/api/portraits/women/68.jpg'
        ]
      },
      images: [
            { 
            uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlCZV9gJJPCNcoMJvkBm1dYDTRRUgClqpq4Q&s', 
            duration: 5000,
            caption: 'This is great  #discover'
            },
            { 
            uri: 'https://www.planetware.com/wpimages/2020/02/france-in-pictures-beautiful-places-to-photograph-eiffel-tower.jpg', 
            duration: 5000,
            caption: 'From Paris with love. 🌅 #travel'
            },
            { 
            uri: 'https://images.pexels.com/photos/1590882/pexels-photo-1590882.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500', 
            duration: 5000,
            caption: 'Old beauty in the heart of the city. #architecture'
            },
        ]
    },
    { 
      id: 2,
      profileImage: 'https://images.pexels.com/photos/17691789/pexels-photo-17691789/free-photo-of-beautiful-girl.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      profileName: 'lucy',
      timestamp: '3h ago',
      label: 'In the mood for love',
      comments: {
        count: 56,
        previewUsers: [
          'https://randomuser.me/api/portraits/women/44.jpg',
          'https://randomuser.me/api/portraits/women/68.jpg'
        ]
      },
      images: [
            { 
            uri: 'https://images.unsplash.com/photo-1592599457454-e6ace3370314?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YmxhY2slMjBwZW9wbGUlMjBpbiUyMGxvdmV8ZW58MHx8MHx8fDA%3D', 
            duration: 5000,
            caption: 'hello world #love'
            },
            { 
            uri: 'https://walrus-assets.s3.amazonaws.com/img/SpearChief-Morris_SmallTown_MichelleTheodore_1200.jpeg', 
            duration: 5000,
            caption: 'good morning #sunrise'
            },
            { 
            uri: 'https://ens3xeax5jd.exactdn.com/wp-content/uploads/2023/01/to-my-black-son-mother-holding-baby-in-her-arms.jpg?strip=all&lossy=1&webp=80&avif=70&ssl=1', 
            duration: 5000,
            caption: 'I love you #family'
            },
        ]
    },
    { 
      id: 3,
      profileImage: 'https://images.pexels.com/photos/17691789/pexels-photo-17691789/free-photo-of-beautiful-girl.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      profileName: 'lucy',
      timestamp: '3h ago',
      label: 'In the mood for love',
      comments: {
        count: 98,
        previewUsers: [
          'https://randomuser.me/api/portraits/women/44.jpg',
          'https://randomuser.me/api/portraits/women/68.jpg'
        ]
      },
      images: [
            { 
            uri: 'https://images.unsplash.com/photo-1592599457454-e6ace3370314?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YmxhY2slMjBwZW9wbGUlMjBpbiUyMGxvdmV8ZW58MHx8MHx8fDA%3D', 
            duration: 5000,
            caption: 'hello world #love'
            },
            { 
            uri: 'https://walrus-assets.s3.amazonaws.com/img/SpearChief-Morris_SmallTown_MichelleTheodore_1200.jpeg', 
            duration: 5000,
            caption: 'good morning #sunrise'
            },
            { 
            uri: 'https://ens3xeax5jd.exactdn.com/wp-content/uploads/2023/01/to-my-black-son-mother-holding-baby-in-her-arms.jpg?strip=all&lossy=1&webp=80&avif=70&ssl=1', 
            duration: 5000,
            caption: 'I love you #family'
            },
        ]
    },
    
        

  ];
  
  export const CARD_WIDTH = Dimensions.get('window').width * 0.85;
  export const SPACING = 0;
  export const SNAP_INTERVAL = CARD_WIDTH + SPACING;