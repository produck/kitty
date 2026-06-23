import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_DEPLOYMENT_ARTIFACT = 'deploymentArtifact';
const I_LISTENERS = 'listeners';
const I_LINK = 'link';

const R_FUNCTION = '(...args: any[]) => any';
const R_LISTENERS = `Record<string | symbol, ${R_FUNCTION}>`;
const R_LINK = `(server: object, listeners: ${R_LISTENERS}) => unknown`;

export default deepFreeze({
  M: {
    ARTIFACT: {
      SELF: I_DEPLOYMENT_ARTIFACT,
      LISTENERS: `${I_DEPLOYMENT_ARTIFACT}.${I_LISTENERS}`,
      LINK: `${I_DEPLOYMENT_ARTIFACT}.${I_LINK}`,
    },
  },
  R: {
    FUNCTION: R_FUNCTION,
    LINK: R_LINK,
    LISTENERS: R_LISTENERS,
    ARTIFACT: `{ ${I_LISTENERS}: ${R_LISTENERS}; ${I_LINK}: ${R_LINK} }`,
  },
});
