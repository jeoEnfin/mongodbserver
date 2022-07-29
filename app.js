const Express = require("express");
const ExpressGraphQL = require("express-graphql");
const mongoose = require("mongoose");
const {
	GraphQLID,
	GraphQLString,
	GraphQLList,
	GraphQLType,
	GraphQLSchema,
	GraphQLNonNull,
	GraphQLObjectType
} = require("graphql");
var app = Express();
var cors = require("cors");

app.use(cors());

mongoose
	.connect("mongodb+srv://jeo_enfin:jeo12345@cluster0.u7nwutk.mongodb.net/?retryWrites=true&w=majority"
		
	)
	.then(() => console.log("Connected to database..."))
	.catch(err => console.error(err));

const PersonModel = mongoose.model("person", {
	firstName: String,
	lastName: String
});

const PersonType = new GraphQLObjectType({
	name: "Person",
	fields: {
		id: { type: GraphQLID },
		firstName: { type: GraphQLString },
		lastName: { type: GraphQLString }
	}
});

const schema = new GraphQLSchema({
	query: new GraphQLObjectType({
		name: "Query",
		fields: {
			people: {
				type: GraphQLList(PersonType),
				resolve: (root, args, context, info) => {
					return PersonModel.find().exec();
				}
			},
			peopleByID: {
				type: PersonType,
				args: {
					id: { type: GraphQLNonNull(GraphQLID) }
				},
				resolve: (root, args, context, info) => {
					return PersonModel.findById(args.id).exec();
				}
			},
			peopleByName: {
				type: GraphQLList(PersonType),
				args: { 
					firstName: { type: GraphQLString } 
				},
				resolve: (root, args, context, info) => {
					return PersonModel.find({'firstName':args.firstName}).exec();
				}
			}
		}
	}),

	mutation: new GraphQLObjectType({
		name: "Create",
		fields: {
			people: {
				type: PersonType,
				args: {
					firstName: { type: GraphQLString },
					lastName: { type: GraphQLString }
				},
				resolve: (root, args, context, info) => {
					var people = new PersonModel(args);
					return people.save();
				}
			}
		}
	})
});

app.use("/person",	ExpressGraphQL({schema, graphiql: true}));

app.listen(3001, () => {
	console.log("server running at 3001");
});
