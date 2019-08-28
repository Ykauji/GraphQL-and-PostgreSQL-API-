const express = require('express')
const expressGraphQL = require('express-graphql')
const app = express()
const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLNonNull,
} = require('graphql')

const hairs = [ 
	{id: 1, name: 'short men asian', image: 'potato', description: 'bob', stylistId: 1 },
	{id: 2, name: 'short femen asian', image: 'totato', description: 'sob', stylistId: 1 },
	{id: 3, name: 'short remen asian', image: 'yotato', description: 'pob', stylistId: 1 },
	{id: 4, name: 'short jemen asian', image: 'aotato', description: 'tob', stylistId: 1 }
]

const stylists = [
{id: 1, name: 'Yohji Kusakabe', image: 'potato', description: 'tomato'},
{id: 2, name: 'Jing Jiang', image: 'is a', description: 'fool'},
{id: 3, name: 'Jonathan Hobobo', image: 'asda', description: 'asdmf'},
]

const StylistType = new GraphQLObjectType({
	name: 'stylist',
	description: 'This is the hair stylist object', 
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt)},
		name: { type: GraphQLNonNull(GraphQLString)},
		image: { type: GraphQLNonNull(GraphQLString)},
		description: { type: GraphQLString}, 
		hairstyles: {
			type: GraphQLList(HairType),
			resolve: (stylist) => {
				return hairs.filter(hair => hair.stylistId === stylist.id)
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
		stylist: {
			type: StylistType,
			resolve: (hairs) => {
				return stylists.find(stylist => stylist.id === hairs.stylistId)
			}
		}
	})
})

const RootQueryType = new GraphQLObjectType({
	name: 'Query',
	description: 'Root Query',
	fields: () => ({
		hairstyles: {
			type: new GraphQLList(HairType),
			description: 'List of all hairstyles',
			resolve: () => hairs
		},
		hairstyle: {
			type: HairType,
			description: 'Get hairstyle by Id',
			args: {
				id: {type: GraphQLInt}
			},
			resolve: (parent, args) => hairs.find(hair => hair.id === args.id)
		},
		stylists: {
			type: new GraphQLList(StylistType),
			description: 'List of hair stylists',
			resolve: () => stylists
		},
		stylist: {
			type: StylistType,
			description: 'Find hair stylist by Id',
			args: {
				id: {type: GraphQLInt},
			},
			resolve: (parent,args) => stylists.find(stylist => stylist.id === args.id)
		},
	})
})

const schema = new GraphQLSchema({
	query: RootQueryType,
})

app.use('/graphql', expressGraphQL({
	schema: schema,
	graphiql: true,
}))
app.listen(5000., () => console.log('server running!'))