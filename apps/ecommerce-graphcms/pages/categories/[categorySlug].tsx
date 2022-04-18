import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { Resize } from '@cloudinary/url-gen/actions';
import Button from '@components/Button';
import Container from '@components/Container';
import Layout from '@components/Layout';
import { buildImage } from '@lib/cloudinary';
import styles from '@styles/Page.module.scss';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { GetStaticPathsContext, GetStaticPropsContext } from 'next/types';

type CategoryProps = {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  products: {
    id: string;
    name: string;
    price: number;
    slug: string;
    image: {
      public_id: string;
      url: string;
      height: number;
      width: number;
    };
  }[];
};

export default function Category({ category, products }: CategoryProps) {
  return (
    <Layout>
      <Head>
        <title>{category.name}</title>
        <meta name="description" content="Generated by create next app" />
      </Head>

      <Container>
        <h1>{category.name}</h1>

        <h2>Products</h2>

        <ul className={styles.products}>
          {products.map((product) => {
            const imageURL = buildImage(product.image.public_id)
              .resize(Resize.scale().width(900).height(900))
              .toURL();
            return (
              <li key={product.id}>
                <Link href={`/products/${product.slug}`}>
                  <a>
                    <div className={styles.productImage}>
                      <Image
                        width={900}
                        height={900}
                        src={imageURL}
                        alt={product.name}
                        unoptimized={true}
                      />
                    </div>
                    <h3 className={styles.productTitle}>{product.name}</h3>
                    <p className={styles.productPrice}>
                      ${product.price.toFixed(2)}
                    </p>
                  </a>
                </Link>
                <p>
                  <Button
                    className="snipcart-add-item"
                    data-item-id={product.id}
                    data-item-price={product.price}
                    data-item-url={`products/${product.slug}`}
                    data-item-image={product.image.url}
                    data-item-name={product.name}
                  >
                    Add to Cart
                  </Button>
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Layout>
  );
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ categorySlug: string }>) {
  const client = new ApolloClient({
    uri: 'https://api-eu-central-1.graphcms.com/v2/cl23dwaya5cng01z49zwjhdtm/master',
    cache: new InMemoryCache(),
  });

  const resp = await client.query({
    query: gql`
      query PageCategory($slug: String) {
        category(where: { slug: $slug }) {
          id
          name
          slug
          products {
            id
            image
            name
            price
            slug
          }
        }
      }
    `,
    variables: {
      slug: params.categorySlug,
    },
  });

  const category = resp.data.category;

  return {
    props: { category, products: category.products },
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const client = new ApolloClient({
    uri: 'https://api-eu-central-1.graphcms.com/v2/cl23dwaya5cng01z49zwjhdtm/master',
    cache: new InMemoryCache(),
  });

  const resp = await client.query({
    query: gql`
      query PageCategories {
        categories {
          id
          slug
        }
      }
    `,
  });

  const paths = resp.data.categories.map((category) => ({
    params: {
      categorySlug: category.slug,
    },
  }));

  return {
    paths: [
      ...paths,
      ...paths.flatMap((path) => {
        return locales.map((locale) => {
          return {
            ...path,
            locale,
          };
        });
      }),
    ],
    fallback: false,
  };
}
