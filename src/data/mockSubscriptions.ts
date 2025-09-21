import { Subscription, SubscriptionStats } from '../services/subscription';

// Mock subscription data
export const mockSubscriptions: Subscription[] = [
  {
    _id: 'sub_001',
    userId: {
      _id: 'user_001',
      displayName: 'Sarah Johnson',
      email: 'sarah.johnson@email.com'
    },
    planType: 'premium',
    status: 'active',
    startDate: '2024-01-15T00:00:00.000Z',
    endDate: '2024-02-15T00:00:00.000Z',
    autoRenew: true,
    price: 29.99,
    currency: 'USD',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    _id: 'sub_002',
    userId: {
      _id: 'user_002',
      displayName: 'Michael Chen',
      email: 'michael.chen@company.com'
    },
    planType: 'enterprise',
    status: 'active',
    startDate: '2024-01-10T00:00:00.000Z',
    endDate: '2024-04-10T00:00:00.000Z',
    autoRenew: true,
    price: 99.99,
    currency: 'USD',
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z'
  },
  {
    _id: 'sub_003',
    userId: {
      _id: 'user_003',
      displayName: 'Emily Rodriguez',
      email: 'emily.rodriguez@startup.io'
    },
    planType: 'basic',
    status: 'active',
    startDate: '2024-01-20T00:00:00.000Z',
    endDate: '2024-02-20T00:00:00.000Z',
    autoRenew: false,
    price: 9.99,
    currency: 'USD',
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z'
  },
  {
    _id: 'sub_004',
    userId: {
      _id: 'user_004',
      displayName: 'David Kim',
      email: 'david.kim@techcorp.com'
    },
    planType: 'premium',
    status: 'cancelled',
    startDate: '2023-12-01T00:00:00.000Z',
    endDate: '2024-01-01T00:00:00.000Z',
    autoRenew: false,
    price: 29.99,
    currency: 'USD',
    createdAt: '2023-12-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: 'sub_005',
    userId: {
      _id: 'user_005',
      displayName: 'Lisa Wang',
      email: 'lisa.wang@designstudio.com'
    },
    planType: 'enterprise',
    status: 'expired',
    startDate: '2023-11-15T00:00:00.000Z',
    endDate: '2024-01-15T00:00:00.000Z',
    autoRenew: false,
    price: 99.99,
    currency: 'USD',
    createdAt: '2023-11-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    _id: 'sub_006',
    userId: {
      _id: 'user_006',
      displayName: 'James Wilson',
      email: 'james.wilson@consulting.com'
    },
    planType: 'basic',
    status: 'inactive',
    startDate: '2024-01-05T00:00:00.000Z',
    endDate: '2024-02-05T00:00:00.000Z',
    autoRenew: false,
    price: 9.99,
    currency: 'USD',
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-25T00:00:00.000Z'
  },
  {
    _id: 'sub_007',
    userId: {
      _id: 'user_007',
      displayName: 'Maria Garcia',
      email: 'maria.garcia@retail.com'
    },
    planType: 'premium',
    status: 'active',
    startDate: '2024-01-12T00:00:00.000Z',
    endDate: '2024-02-12T00:00:00.000Z',
    autoRenew: true,
    price: 29.99,
    currency: 'USD',
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z'
  },
  {
    _id: 'sub_008',
    userId: {
      _id: 'user_008',
      displayName: 'Robert Taylor',
      email: 'robert.taylor@finance.com'
    },
    planType: 'enterprise',
    status: 'active',
    startDate: '2024-01-08T00:00:00.000Z',
    endDate: '2024-04-08T00:00:00.000Z',
    autoRenew: true,
    price: 99.99,
    currency: 'USD',
    createdAt: '2024-01-08T00:00:00.000Z',
    updatedAt: '2024-01-08T00:00:00.000Z'
  },
  {
    _id: 'sub_009',
    userId: {
      _id: 'user_009',
      displayName: 'Jennifer Brown',
      email: 'jennifer.brown@healthcare.com'
    },
    planType: 'basic',
    status: 'active',
    startDate: '2024-01-18T00:00:00.000Z',
    endDate: '2024-02-18T00:00:00.000Z',
    autoRenew: true,
    price: 9.99,
    currency: 'USD',
    createdAt: '2024-01-18T00:00:00.000Z',
    updatedAt: '2024-01-18T00:00:00.000Z'
  },
  {
    _id: 'sub_010',
    userId: {
      _id: 'user_010',
      displayName: 'Alex Thompson',
      email: 'alex.thompson@education.edu'
    },
    planType: 'premium',
    status: 'cancelled',
    startDate: '2023-12-20T00:00:00.000Z',
    endDate: '2024-01-20T00:00:00.000Z',
    autoRenew: false,
    price: 29.99,
    currency: 'USD',
    createdAt: '2023-12-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z'
  },
  {
    _id: 'sub_011',
    userId: {
      _id: 'user_011',
      displayName: 'Amanda Davis',
      email: 'amanda.davis@marketing.com'
    },
    planType: 'enterprise',
    status: 'active',
    startDate: '2024-01-03T00:00:00.000Z',
    endDate: '2024-04-03T00:00:00.000Z',
    autoRenew: true,
    price: 99.99,
    currency: 'USD',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z'
  },
  {
    _id: 'sub_012',
    userId: {
      _id: 'user_012',
      displayName: 'Kevin Lee',
      email: 'kevin.lee@logistics.com'
    },
    planType: 'basic',
    status: 'expired',
    startDate: '2023-12-10T00:00:00.000Z',
    endDate: '2024-01-10T00:00:00.000Z',
    autoRenew: false,
    price: 9.99,
    currency: 'USD',
    createdAt: '2023-12-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z'
  }
];

// Mock subscription stats
export const mockSubscriptionStats: SubscriptionStats = {
  totalSubscriptions: 12,
  activeSubscriptions: 7,
  monthlyRevenue: 2849.82,
  averageRevenuePerUser: 237.49,
  planDistribution: {
    basic: 4,
    premium: 4,
    enterprise: 4
  }
};

// Mock service functions
export const mockSubscriptionService = {
  async getAllSubscriptions(page: number = 1) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const limit = 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mockSubscriptions.slice(startIndex, endIndex);
    
    return {
      message: 'Subscriptions fetched successfully',
      data: paginatedData,
      pagination: {
        total: mockSubscriptions.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(mockSubscriptions.length / limit),
        hasMore: endIndex < mockSubscriptions.length
      }
    };
  },

  async getSubscriptionStats() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      message: 'Subscription stats fetched successfully',
      data: mockSubscriptionStats
    };
  },

  async cancelSubscription(subscriptionId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find and update the subscription in mock data
    const subscription = mockSubscriptions.find(sub => sub._id === subscriptionId);
    if (subscription) {
      subscription.status = 'cancelled';
      subscription.autoRenew = false;
      subscription.updatedAt = new Date().toISOString();
    }
  },

  async reactivateSubscription(subscriptionId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find and update the subscription in mock data
    const subscription = mockSubscriptions.find(sub => sub._id === subscriptionId);
    if (subscription) {
      subscription.status = 'active';
      subscription.autoRenew = true;
      subscription.updatedAt = new Date().toISOString();
    }
  }
};
