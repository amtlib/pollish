import { list } from '@keystone-6/core';

import {
  text,
  relationship,
  password,
  timestamp,
  select,
  virtual,
} from '@keystone-6/core/fields';
// The document field is a more complicated field, so it's in its own package
// Keystone aims to have all the base field types, but you can make your own
// custom ones.
import { document } from '@keystone-6/fields-document';

// We have a users list, a blogs list, and tags for blog posts, so they can be filtered.
// Each property on the exported object will become the name of a list (a.k.a. the `listKey`),
// with the value being the definition of the list, including the fields.
export const lists = {
  User: list({
    fields: {
      firstName: text({ validation: { isRequired: true } }),
      lastName: text({ validation: { isRequired: true } }),
      birthDate: timestamp(),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
        isFilterable: true,
      }),
      password: password({ validation: { isRequired: true } }),
      
      // Relationships allow us to reference other lists. In this case,
      // we want a user to have many posts, and we are saying that the user
      // should be referencable by the 'author' field of posts.
      // Make sure you read the docs to understand how they work: https://keystonejs.com/docs/guides/relationships#understanding-relationships
      district: relationship({ ref: 'District.users', many: false }),
      accountType: relationship({ ref: 'AccountType.users', many: false }),
      polls: relationship({ ref: 'Poll.createdBy', many: true }),
      responses: relationship({ ref: 'Response.user', many: true }),
    },
    ui: {
      labelField: 'firstName',
      listView: {
        initialColumns: ['firstName', 'lastName', 'district'],
      },
    },
  }),
  District: list({
    fields: {
      name: text({ validation: { isRequired: true }}),
      users: relationship({
        ref: 'User.district',
        ui: {
          displayMode: 'cards',
          cardFields: ['firstName', 'lastName'],
          linkToItem: true,
        }
      })
    },
    ui: {
      labelField: 'name',
      listView: {
        initialColumns: ['name'],
      },
    },
  }),
  AccountType: list({
    fields: {
      name: text({ validation: { isRequired: true }}),
      users: relationship({
        ref: 'User.accountType',
        ui: {
          displayMode: 'cards',
          cardFields: ['firstName', 'lastName'],
          linkToItem: true,
        }
      })
    },
    ui: {
      labelField: 'name'
    }
  }),
  Poll: list({
    fields: {
      question: text({validation: {isRequired: true}}),
      createdAt: timestamp({ defaultValue: { kind: 'now' }}),
      createdBy: relationship({ ref: 'User.polls'}),
      access: relationship({ ref: 'PollAccess.polls' }),
      answers: relationship({ ref: 'Answer.poll', many: true}),
      tags: relationship({ ref: 'Tag.polls', many: true}),
    },
    ui: {
      labelField: 'question',
      listView: {
        initialColumns: ['question', 'createdBy'],
      },
    },
  }),
  PollAccess: list({
    fields: {
      level: select({
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Public', value: 'public' },
        ],
        // We want to make sure new posts start off as a draft when they are created
        defaultValue: 'draft',
        // fields also have the ability to configure their appearance in the Admin UI
        ui: {
          displayMode: 'segmented-control',
        },
      }),
      polls: relationship({ ref: 'Poll.access' })
    },
    ui: {
      labelField: 'level',
    } 
  }),
  Answer: list({
    fields: {
      answer: text({ validation: { isRequired: true }}),
      poll: relationship({ ref: 'Poll.answers'}),
      responses: relationship({ ref: 'Response.answer', many: true})
    },
    ui: {
      labelField: 'answer',
      isHidden: true
    }
  }),
  Response: list({
    fields: {
      answer: relationship({ ref: 'Answer.responses' }),
      user: relationship({ ref: 'User.responses' })
    },
    ui: {
      labelField: 'answer',
      isHidden: true
    }
  }),
  Tag: list({
    fields: {
      name: text({validation: {isRequired: true}}),
      polls: relationship({ ref: 'Poll.tags', many: true})
    }
  })
  // Our second list is the Posts list. We've got a few more fields here
  // so we have all the info we need for displaying posts.
  // Post: list({
  //   fields: {
  //     title: text(),
  //     // Having the status here will make it easy for us to choose whether to display
  //     // posts on a live site.
  //     status: select({
  //       options: [
  //         { label: 'Published', value: 'published' },
  //         { label: 'Draft', value: 'draft' },
  //       ],
  //       // We want to make sure new posts start off as a draft when they are created
  //       defaultValue: 'draft',
  //       // fields also have the ability to configure their appearance in the Admin UI
  //       ui: {
  //         displayMode: 'segmented-control',
  //       },
  //     }),
  //     // The document field can be used for making highly editable content. Check out our
  //     // guide on the document field https://keystonejs.com/docs/guides/document-fields#how-to-use-document-fields
  //     // for more information
  //     content: document({
  //       formatting: true,
  //       layouts: [
  //         [1, 1],
  //         [1, 1, 1],
  //         [2, 1],
  //         [1, 2],
  //         [1, 2, 1],
  //       ],
  //       links: true,
  //       dividers: true,
  //     }),
  //     publishDate: timestamp(),
  //     // Here is the link from post => author.
  //     // We've configured its UI display quite a lot to make the experience of editing posts better.
  //     author: relationship({
  //       ref: 'User.posts',
  //       ui: {
  //         displayMode: 'cards',
  //         cardFields: ['name', 'email'],
  //         inlineEdit: { fields: ['name', 'email'] },
  //         linkToItem: true,
  //         inlineCreate: { fields: ['name', 'email'] },
  //       },
  //     }),
  //     // We also link posts to tags. This is a many <=> many linking.
  //     tags: relationship({
  //       ref: 'Tag.posts',
  //       ui: {
  //         displayMode: 'cards',
  //         cardFields: ['name'],
  //         inlineEdit: { fields: ['name'] },
  //         linkToItem: true,
  //         inlineConnect: true,
  //         inlineCreate: { fields: ['name'] },
  //       },
  //       many: true,
  //     }),
  //   },
  // }),
  // // Our final list is the tag list. This field is just a name and a relationship to posts
  // Tag: list({
  //   ui: {
  //     isHidden: true,
  //   },
  //   fields: {
  //     name: text(),
  //     posts: relationship({ ref: 'Post.tags', many: true }),
  //   },
  // }),
};
