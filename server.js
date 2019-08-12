const express = require("express");
const expressGraphQL = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull
} = require("graphql");

const app = express();

const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" }
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 }
];

// const AuthorType = new GraphQLObjectType({
//   name: "Author",
//   fields: () => ({
//     id: { type: GraphQLID },
//     name: { GraphQLString },
//     books: {
//       type: new GraphQLList(BookType),
//       resolve(parent, args) {
//         return BookType.find({ authorId: parent.id });
//       }
//     }
//   })
// });

const BookType = new GraphQLObjectType({
  name: "Book",
  //Fields needs to return a function instead of just an object because BookType needs reference to AuthorType and vice versa
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve(parent, args) {
        return authors.find(author => author.id === parent.authorId);
      }
    }
  })
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        return books.filter(book => book.authorId === parent.id);
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    book: {
      type: BookType,
      args: { id: { type: GraphQLInt } },
      resolve(parent, args) {
        return books.find(book => book.id === args.id);
      }
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLInt } },
      resolve(parent, args) {
        return authors.find(author => author.id === args.id);
      }
    },
    books: {
      type: new GraphQLList(BookType),
      description: "List of Books",
      resolve: () => books
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of Authors",
      resolve: () => authors
    }
  })
});

const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  description: "RootMutation",
  fields: () => ({
    addBook: {
      type: BookType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId
        };
        books.push(book);
        return book;
      }
    },
    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name
        };
        authors.push(author);
        return author;
      }
    },
    updateAuthor: {
      type: AuthorType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const author = authors.find(author => author.id === args.id);
        if (!author) {
          throw new Error(`Couldnt find author with id ${args.id}`);
        }
        author.name = args.name;
        return author;
      }
    }
  })
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});

app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    graphiql: true
  })
);

app.listen(4000, () => console.log("Server Running"));
