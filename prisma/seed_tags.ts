import { PrismaClient } from '@prisma/client';
import systemTags from './data/system-tags.json';

// Command: npm run db:seed

const prisma = new PrismaClient({
  log: ['warn', 'error']
});

async function seed() {
  console.log('Start seeding...');

  /************
   * Add system tags
   ************/

  // Add a model category tag to tag other tags
  const modelTag = await prisma.tag.upsert({
    where: { id: 100 },
    update: {},
    create: {
      name: 'model category',
      id: 100,
      type: 'System',
      nsfw: 'None',
      target: ['Tag']
    }
  });

  // Add a image category tag to tag other tags
  const imageTag = await prisma.tag.upsert({
    where: { id: 101 },
    update: {},
    create: {
      name: 'image category',
      id: 101,
      type: 'System',
      nsfw: 'None',
      target: ['Tag']
    }
  });

  // Add a post category tag to tag other tags
  const postTag = await prisma.tag.upsert({
    where: { id: 102 },
    update: {},
    create: {
      name: 'post category',
      id: 102,
      type: 'System',
      nsfw: 'None',
      target: ['Tag']
    }
  });

  // Add a article category tag to tag other tags
  const articleTag = await prisma.tag.upsert({
    where: { id: 103 },
    update: {},
    create: {
      name: 'article category',
      id: 103,
      type: 'System',
      nsfw: 'None',
      target: ['Tag']
    }
  });

  await Promise.all(
    systemTags.map(async indivTag => {
      // add tags
      await prisma.tag.upsert({
        where: { id: indivTag.id },
        update: {},
        create: {
          name: indivTag.name,
          id: indivTag.id,
          isCategory: true,
          type: 'Label',
          nsfw: 'None',
          target: ['Model', 'Image', 'Post', 'Article']
        }
      });

      // tag model tags with model category tag
      await prisma.tagsOnTags.upsert({
        where: { 
          fromTagId_toTagId: {
            fromTagId: modelTag.id,
            toTagId: indivTag.id 
          }
        },
        update: {},
        create: {
          fromTag: {
            connect: { id: modelTag.id }
          },
          toTag: {
            connect: { id: indivTag.id }
          }
        }
      });

      // tag image tags with image category tag
      await prisma.tagsOnTags.upsert({
        where: { 
          fromTagId_toTagId: {
            fromTagId: imageTag.id,
            toTagId: indivTag.id 
          }
        },
        update: {},
        create: {
          fromTag: {
            connect: { id: imageTag.id }
          },
          toTag: {
            connect: { id: indivTag.id }
          }
        }
      });

      // tag post tags with post category tag
      await prisma.tagsOnTags.upsert({
        where: { 
          fromTagId_toTagId: {
            fromTagId: postTag.id,
            toTagId: indivTag.id 
          }
        },
        update: {},
        create: {
          fromTag: {
            connect: { id: postTag.id }
          },
          toTag: {
            connect: { id: indivTag.id }
          }
        }
      });

      // tag article tags with article category tag
      await prisma.tagsOnTags.upsert({
        where: { 
          fromTagId_toTagId: {
            fromTagId: articleTag.id,
            toTagId: indivTag.id 
          }
        },
        update: {},
        create: {
          fromTag: {
            connect: { id: articleTag.id }
          },
          toTag: {
            connect: { id: indivTag.id }
          }
        }
      });
    })
  );
}


seed()
  .catch(async (e) => {
    console.error('ERROR:', e);
    await prisma.$disconnect();
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
