import assert from 'node:assert/strict';
import * as http from 'node:http';
import { describe, it } from 'node:test';

import * as Adapter from '../src/Adapter/index.mjs';

describe('::Adapter', () => {
  describe('::isDeploymentArtifact()', () => {
    it('should accept deployment artifact objects.', () => {
      const symbolEvent = Symbol('event');
      const deploymentArtifact = {
        listeners: {
          request() {},
          [symbolEvent]() {},
        },
        link() {},
      };

      assert.equal(
        Adapter.Artifact.isDeploymentArtifact(deploymentArtifact),
        true,
      );
      assert.doesNotThrow(() => {
        Adapter.Artifact.assertDeploymentArtifact(deploymentArtifact);
      });
    });

    it('should reject invalid deployment artifact objects.', () => {
      assert.equal(Adapter.Artifact.isDeploymentArtifact(null), false);
      assert.equal(
        Adapter.Artifact.isDeploymentArtifact({
          listeners: { request: null },
          link() {},
        }),
        false,
      );
      assert.equal(
        Adapter.Artifact.isDeploymentArtifact({ listeners: {}, link: null }),
        false,
      );
      assert.throws(() => {
        Adapter.Artifact.assertDeploymentArtifact({
          listeners: {},
          link: null,
        });
      }, TypeError);
    });
  });

  describe('::define()', () => {
    it('should define a server adapter options.', () => {
      Adapter.Registry.define({
        name: 'http.http11.nodejs',
        constructor: http.Server,
        adapt() {},
      });
    });
  });
});
