import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'A permissioned sidechain',
    description: (
      <>
        HARVEST runs alongside Cardano as a Proof-of-Authority sidechain. Block production is
        round-robin among a set of authorised Node Handlers, which means predictable block times
        and no need for mining hardware.
      </>
    ),
  },
  {
    title: 'One HRV, bridged rather than re-minted',
    description: (
      <>
        HRV is a Cardano native token. Locking it on mainnet makes the equivalent amount available
        on the sidechain, and returning it releases the original. There is no second supply, so
        sidechain HRV can never exceed what is locked.
      </>
    ),
  },
  {
    title: 'Governed by its holders',
    description: (
      <>
        The HARVEST DAO handles proposals, quadratic voting and a multi-signature treasury, with
        Node Handlers reviewing proposals before they reach a vote. The treasury is not yet funded.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
