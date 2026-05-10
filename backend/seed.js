require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/course');
const User = require('./models/user');

const sampleCourses = [
	{
		title: 'Financial Modelling for Agribusiness',
		slug: 'financial-modelling-for-agribusiness',
		description: 'Master practical farm finance with statement reading, ratio analysis, and applied decision models for resilient farm businesses.',
		category: 'Financial Management',
		coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1600&auto=format&fit=crop',
		price: 4500,
		currency: 'KES',
		isFree: false,
		lessons: [
			{
				title: 'Module 1: Understanding Farm Financial Statements',
				duration: '45 minutes',
				order: 1,
				contentHtml:
					'<h2>Understanding Farm Financial Statements</h2><p>A financial statement is the story of your farm told in numbers. You should be comfortable with three statements: Income Statement (profit and loss), Balance Sheet (assets, liabilities, equity), and Cash Flow Statement (real money in and out).</p><h3>Core formulas</h3><ul><li>Gross Profit = Revenue - Cost of Goods Sold</li><li>Net Operating Profit = Gross Profit - Operating Expenses</li></ul><p>A profitable farm can still fail if cash inflows are delayed. Always track timing of receipts and payments using a monthly rolling cash flow.</p>'
			},
			{
				title: 'Module 2: Key Financial Ratios for Farmers',
				duration: '45 minutes',
				order: 2,
				contentHtml:
					'<h2>Key Financial Ratios for Farmers</h2><p>Ratios compress performance into quick decision metrics.</p><ul><li>Current Ratio = Current Assets / Current Liabilities</li><li>Quick Ratio = (Current Assets - Inventory) / Current Liabilities</li><li>Gross Margin % = (Gross Profit / Revenue) x 100</li><li>Debt-to-Equity = Total Liabilities / Total Equity</li></ul><p>Track trend direction across seasons. A worsening trend is an early warning even before a crisis appears in cash position.</p>'
			},
			{
				title: 'End-of-Course Quiz: Financial Modelling',
				duration: '15 minutes',
				order: 3,
				isQuiz: true,
				contentHtml: '<h2>End-of-Course Quiz: Financial Modelling</h2>',
				quiz: {
					questions: [
						{
							question: 'A farm has current assets KES 850,000 and current liabilities KES 500,000. What is the current ratio?',
							options: ['0.59', '1.70', '1.35', '2.00'],
							answer: 1
						},
						{
							question: 'Revenue is KES 2,000,000 and COGS is KES 1,200,000. What is the gross margin percentage?',
							options: ['40%', '60%', '20%', '80%'],
							answer: 0
						},
						{
							question: 'Total costs are KES 400,000 and market price is KES 20/kg. What is the break-even yield?',
							options: ['8,000 kg', '20,000 kg', '400 kg', '40,000 kg'],
							answer: 1
						},
						{
							question: 'Which financial statement shows real money flowing in and out of the farm?',
							options: ['Balance Sheet', 'Income Statement', 'Cash Flow Statement', 'Equity Statement'],
							answer: 2
						},
						{
							question: 'A worsening Debt-to-Equity ratio over multiple seasons indicates:',
							options: ['Improving farm profitability', 'Increasing financial risk', 'Better liquidity', 'Higher gross margin'],
							answer: 1
						}
					]
				}
			}
		]
	},
	{
		title: 'Irrigation & Water Management',
		slug: 'irrigation-water-management',
		description: 'Master drip, sprinkler, and furrow irrigation systems to maximise yield while conserving water on your farm.',
		category: 'Water Management',
		coverImage: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=1600&auto=format&fit=crop',
		price: 3200,
		currency: 'KES',
		isFree: false,
		lessons: [
			{
				title: 'Module 1: Water Sources & Farm Water Budgeting',
				duration: '40 minutes',
				order: 1,
				contentHtml: '<h2>Water Sources & Farm Water Budgeting</h2><p>Identify reliable water sources — boreholes, rivers, rainwater harvesting — and calculate your crop water requirement (ETc = Kc × ETo). A water budget prevents over-irrigation and reduces pumping costs.</p><ul><li>ETo: Reference evapotranspiration (mm/day)</li><li>Kc: Crop coefficient (varies by growth stage)</li><li>ETc = Kc × ETo</li></ul>'
			},
			{
				title: 'Module 2: Drip & Sprinkler Systems',
				duration: '40 minutes',
				order: 2,
				contentHtml: '<h2>Drip & Sprinkler Systems</h2><p>Drip irrigation delivers water directly to the root zone, achieving 90%+ efficiency. Sprinklers suit field crops and orchards. Compare capital cost, maintenance, and suitability per crop type before choosing a system.</p>'
			},
			{
				title: 'Module 3: Scheduling & Automation',
				duration: '35 minutes',
				order: 3,
				contentHtml: '<h2>Scheduling & Automation</h2><p>Use soil moisture sensors or tensiometers to trigger irrigation only when needed. Automate with timers or IoT controllers to reduce labour and prevent under/over-watering.</p>'
			},
			{
				title: 'End-of-Course Quiz: Irrigation & Water Management',
				duration: '15 minutes',
				order: 4,
				isQuiz: true,
				contentHtml: '<h2>End-of-Course Quiz</h2>',
				quiz: {
					questions: [
						{
							question: 'A crop has Kc = 1.2 and ETo = 5 mm/day. What is the daily crop water requirement?',
							options: ['4.2 mm', '6.0 mm', '5.0 mm', '7.2 mm'],
							answer: 1
						},
						{
							question: 'Which irrigation method has the highest water-use efficiency?',
							options: ['Flood irrigation', 'Furrow irrigation', 'Drip irrigation', 'Sprinkler irrigation'],
							answer: 2
						},
						{
							question: 'What device measures soil moisture tension to guide irrigation scheduling?',
							options: ['Hygrometer', 'Tensiometer', 'Barometer', 'Anemometer'],
							answer: 1
						},
						{
							question: 'Rainwater harvesting is most effective when combined with:',
							options: ['Open field flooding', 'Storage tanks and slow-release drip lines', 'Daily manual watering', 'Overhead sprinklers only'],
							answer: 1
						},
						{
							question: 'Over-irrigation primarily causes:',
							options: ['Faster crop growth', 'Root aeration and nutrient leaching', 'Higher Kc values', 'Reduced ETo'],
							answer: 1
						}
					]
				}
			}
		]
	},
	{
		title: 'Organic Pest & Disease Control',
		slug: 'organic-pest-disease-control',
		description: 'Identify common crop pests and diseases and manage them using safe, low-cost organic methods.',
		category: 'Crop Protection',
		coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600&auto=format&fit=crop',
		price: 0,
		currency: 'KES',
		isFree: true,
		lessons: [
			{
				title: 'Module 1: Identifying Common Pests',
				duration: '35 minutes',
				order: 1,
				contentHtml: '<h2>Identifying Common Pests</h2><p>Early identification is the first line of defence. Learn to spot aphids, whiteflies, stem borers, and fall armyworm by their damage patterns. Scout fields weekly — check undersides of leaves and stem bases.</p>'
			},
			{
				title: 'Module 2: Organic Control Methods',
				duration: '40 minutes',
				order: 2,
				contentHtml: '<h2>Organic Control Methods</h2><p>Neem oil, pyrethrin extracts, and chilli-garlic sprays disrupt pest feeding and reproduction without harmful residues. Introduce beneficial insects (ladybirds, parasitic wasps) to naturally suppress populations.</p><ul><li>Neem oil: 2–5 ml/litre water, spray every 7 days</li><li>Chilli-garlic spray: blend 100g chilli + 100g garlic in 1L water, dilute 1:10</li></ul>'
			},
			{
				title: 'Module 3: Disease Prevention & Crop Rotation',
				duration: '35 minutes',
				order: 3,
				contentHtml: '<h2>Disease Prevention & Crop Rotation</h2><p>Fungal and bacterial diseases spread through soil, water splash, and infected seed. Rotate crops by family each season to break disease cycles. Remove and destroy infected plant material immediately.</p>'
			}
		]
	},
	{
		title: 'Soil Health & Composting Basics',
		slug: 'soil-health-composting-basics',
		description: 'Understand soil structure, fertility, and how to make high-quality compost to boost your farm productivity for free.',
		category: 'Soil Management',
		coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600&auto=format&fit=crop',
		price: 0,
		currency: 'KES',
		isFree: true,
		lessons: [
			{
				title: 'Module 1: Understanding Soil Structure',
				duration: '30 minutes',
				order: 1,
				contentHtml: '<h2>Understanding Soil Structure</h2><p>Soil is made of mineral particles, organic matter, water, air, and living organisms. Sandy soils drain fast but hold few nutrients; clay soils retain water but compact easily. Loam — a balanced mix — is ideal for most crops.</p><p>Test your soil texture by the jar test: fill a jar with soil and water, shake, and observe the settling layers after 24 hours.</p>'
			},
			{
				title: 'Module 2: Making Quality Compost',
				duration: '40 minutes',
				order: 2,
				contentHtml: '<h2>Making Quality Compost</h2><p>Good compost requires a carbon-to-nitrogen ratio of 25–30:1. Layer brown materials (dry stalks, cardboard) with green materials (kitchen scraps, fresh manure). Keep the pile moist and turn every 2 weeks. Ready compost is dark, crumbly, and earthy-smelling.</p><ul><li>Browns (carbon): dry leaves, straw, cardboard</li><li>Greens (nitrogen): vegetable scraps, grass clippings, manure</li><li>Ideal moisture: squeeze a handful — a few drops should come out</li></ul>'
			},
			{
				title: 'Module 3: Applying Compost & Cover Crops',
				duration: '30 minutes',
				order: 3,
				contentHtml: '<h2>Applying Compost & Cover Crops</h2><p>Apply 2–5 tonnes of compost per hectare before planting. Incorporate into the top 15 cm of soil. Grow cover crops (legumes, mucuna) in the off-season to fix nitrogen, suppress weeds, and prevent erosion.</p>'
			}
		]
	},
	{
		title: 'Sustainable Farming Practices',
		slug: 'sustainable-farming-practices',
		description: 'Build a productive and environmentally resilient farm through soil, water, biodiversity, and carbon-smart practice.',
		category: 'Sustainability',
		coverImage: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1600&auto=format&fit=crop',
		price: 3800,
		currency: 'KES',
		isFree: false,
		lessons: [
			{
				title: 'Module 1: Foundations of Sustainable Agriculture',
				duration: '45 minutes',
				order: 1,
				contentHtml:
					'<h2>Foundations of Sustainable Agriculture</h2><p>Sustainable agriculture balances environmental, economic, and social outcomes. It protects farm productivity over generations.</p>'
			},
			{
				title: 'Module 2: Soil Health Management',
				duration: '45 minutes',
				order: 2,
				contentHtml:
					'<h2>Soil Health Management</h2><p>Healthy soil is a living ecosystem. Improve structure and water holding through reduced disturbance, living roots, and organic matter retention.</p>'
			},
			{
				title: 'Module 3: Water Management and Conservation',
				duration: '45 minutes',
				order: 3,
				contentHtml:
					'<h2>Water Management and Conservation</h2><p>Plan for dry seasons by maximizing infiltration, reducing runoff, and improving irrigation efficiency.</p>'
			},
			{
				title: 'Module 4: Biodiversity and Agroecology',
				duration: '45 minutes',
				order: 4,
				contentHtml:
					'<h2>Biodiversity and Agroecology</h2><p>Mixed systems reduce pest pressure and improve resilience. Use intercropping, hedgerows, and habitat restoration.</p>'
			},
			{
				title: 'Module 5: Carbon Sequestration and Climate Resilience',
				duration: '45 minutes',
				order: 5,
				contentHtml:
					'<h2>Carbon Sequestration and Climate Resilience</h2><p>Track emissions and sequestration. Carbon-smart management can increase resilience and unlock future market opportunities.</p>'
			},
			{
				title: 'Module Assessment: Sustainable Farming Practices',
				duration: '20 minutes',
				order: 6,
				isQuiz: true,
				contentHtml: '<h2>Module Assessment: Sustainable Farming Practices</h2>',
				quiz: {
					questions: [
						{
							question: 'Which farming practice best reduces soil erosion on sloped land?',
							options: ['Deep ploughing', 'Contour farming and cover crops', 'Monoculture planting', 'Frequent tillage'],
							answer: 1
						},
						{
							question: 'Intercropping primarily helps by:',
							options: ['Increasing chemical use', 'Reducing biodiversity', 'Reducing pest pressure and improving resilience', 'Simplifying harvest'],
							answer: 2
						},
						{
							question: 'Carbon sequestration in farming refers to:',
							options: ['Burning crop residues', 'Storing carbon in soil and biomass', 'Increasing synthetic fertiliser use', 'Reducing crop diversity'],
							answer: 1
						},
						{
							question: 'Which practice improves water infiltration and reduces runoff?',
							options: ['Compacting soil with heavy machinery', 'Removing all vegetation', 'Maintaining organic matter and cover crops', 'Frequent deep tillage'],
							answer: 2
						},
						{
							question: 'Agroecology is best described as:',
							options: ['Using only chemical inputs for maximum yield', 'Applying ecological principles to design sustainable farming systems', 'Monoculture farming at large scale', 'Eliminating all pests with pesticides'],
							answer: 1
						}
					]
				}
			}
		]
	}
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/farmers-lms';
        
        // Connect to MongoDB Atlas
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas');

        // Clear existing courses
        await Course.deleteMany({});
        console.log('✅ Cleared existing courses');

        // Create a default admin user if none exists
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@farmerslms.com',
                passwordHash: hashedPassword, // FIXED: Changed from 'password' to 'passwordHash'
                role: 'admin'
            });
            console.log('✅ Created admin user');
        } else {
            console.log('✅ Admin user already exists');
        }

        // Add courses with admin as creator
        for (const courseData of sampleCourses) {
            const course = new Course({
                ...courseData,
                createdBy: adminUser._id
            });
            await course.save();
            console.log(`✅ Created course: ${course.title}`);
        }

        console.log('🎉 Database seeded successfully!');
        console.log(`📚 Added ${sampleCourses.length} courses to the database`);
        console.log('🔗 You can now view courses at: http://localhost:5000/api/courses');
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
