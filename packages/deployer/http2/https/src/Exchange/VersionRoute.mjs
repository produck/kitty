export const isHttp2 = (internal) => internal.stream !== undefined;

export function byContext({ h1, h2 }) {
  return (context, ...args) => {
    return (isHttp2(context.internal) ? h2 : h1)(context, ...args);
  };
}

export function byInternal({ h1, h2 }) {
  return (internal) => (isHttp2(internal) ? h2 : h1)(internal);
}
