const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLNonNull,
	QueryArguments,
} = require('graphql')

// Salon object, add later. {1,'bob salon','picture.jpg','good salon'}
const SalonType = new GraphQLObjectType({
	name: 'salon',
	description: 'This is the salon object',
	fields: () => ({
		id: {type: GraphQLNonNull(GraphQLInt)},
		name: { type: GraphQLNonNull(GraphQLString)},
		image: { type: GraphQLNonNull(GraphQLString)},
		description: { type: GraphQLString}, 
		stylists: { 
			type: GraphQLList(StylistType),
			resolve: (parent,args) => {
				const query = `SELECT * FROM hair_stylists WHERE salon_id=${parent.id}`
				return db.any(query)
					.then(data => {
						return data;
					})
					.catch(err => {
						return 'The error is',err;
					});	
			}
		}
	})
}) 

// Stylist object with hairstyles as "ref"
const StylistType = new GraphQLObjectType({
	name: 'stylist',
	description: 'This is the hair stylist object', 
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt)},
		name: { type: GraphQLNonNull(GraphQLString)},
		image: { type: GraphQLNonNull(GraphQLString)},
		description: { type: GraphQLString}, 
		location: { type: GraphQLString },
		phone: { type: GraphQLString }, 
		email: { type: GraphQLString },
		hairstyles: {
			type: GraphQLList(HairType),
			// parent = currentObj, args is the graphql parameters. should return list. 
			resolve: (parent,args) => {
				const query = `SELECT * FROM hair_styles WHERE stylist_id=${parent.id}`
				return db.any(query)
					.then(data => {
						return data;
					})
					.catch(err => {
						return 'The error is',err;
					});
			}
		}
	})
})


const HairType = new GraphQLObjectType({
	name: 'hairstyles',
	description: 'This is a hairstyle!',
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt)},
		name: { type: GraphQLNonNull(GraphQLString)},
		image: { type: GraphQLNonNull(GraphQLString)},
		description: { type: GraphQLString}, 
		stylistId: { type: GraphQLNonNull(GraphQLInt)},
		likes: {type: GraphQLInt},
		length: {type: GraphQLString},
		gender: {type: GraphQLString}, 
		thickness: {type: GraphQLString},
		color: {type: GraphQLString},
		perm: {type: GraphQLString},
		stylist: {
			type: StylistType,
			resolve: (parentVal,args) => {
				const query = `SELECT * FROM hair_stylists WHERE id=${parentVal.stylist_id}`
				// should return one value. 
				return db.one(query)
					.then(data => {
						return data;
					})
					.catch(err => {
						return 'The error is',err;
					});
			}
		}
	})
})

exports.HairType = HairType
exports.StylistType = StylistType
exports.SalonType = SalonType