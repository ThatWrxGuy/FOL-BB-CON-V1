/**
 * Busy Bee SDK
 * 
 * Frontend SDK for the Flower Architecture
 * 
 * @version 1.0.0
 */

// Use mock client for demo - replace with client.js in production
import mockClient from './mockClient';

// Re-export everything from mock client
export const {
  configure,
  setContext,
  getContext,
  Workspace,
  Finance,
  Executive,
  Health,
  Career,
  Lattice,
  Paths,
  Audit,
} = mockClient;

// Alias for consistency
export const BusyBee = {
  configure,
  setContext,
  getContext,
  Workspace,
  Finance,
  Executive,
  Health,
  Career,
  Lattice,
  Paths,
  Audit,
};

export default BusyBee;
