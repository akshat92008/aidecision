import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { FinalReport } from '@/lib/shared/schemas';

// High-Density Command Style PDF Template
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#050505',
    color: '#e1e1e1',
    fontFamily: 'Helvetica', // Will fallback to Helvetica if specialized mono fonts aren't loaded
  },
  section: {
    marginBottom: 20,
    borderLeft: 2,
    borderLeftColor: '#10b981',
    paddingLeft: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    color: '#10b981',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    padding: 10,
    border: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#0a0a0a',
  },
  label: {
    fontSize: 10,
    color: '#71717a',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  viability: {
    fontSize: 48,
    fontWeight: 'heavy',
    color: '#10b981',
  },
  roadmapItem: {
    marginBottom: 10,
    fontSize: 10,
    color: '#a1a1aa',
  },
  truthBomb: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#f87171',
    marginTop: 10,
  }
});

export const PdfReport = ({ report, query }: { report: FinalReport; query: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Nexus Strategic Audit v2.0</Text>
          <Text style={styles.header}>{query}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.label}>Decision Score</Text>
          <Text style={styles.viability}>{report.viability_score.toFixed(0)}%</Text>
        </View>
      </View>

      {/* EXECUTIVE SUMMARY */}
      <View style={styles.section}>
        <Text style={styles.label}>Executive Audit Summary</Text>
        <Text style={{ fontSize: 11, lineHeight: 1.5 }}>{report.summary}</Text>
      </View>

      {/* SCORE BREAKDOWN */}
      <View style={{ ...styles.row, gap: 10 }}>
        <View style={{ ...styles.card, flex: 1 }}>
          <Text style={styles.label}>Demand Weight</Text>
          <Text style={styles.value}>{report.score_breakdown.demand}/30</Text>
        </View>
        <View style={{ ...styles.card, flex: 1 }}>
          <Text style={styles.label}>Execution Score</Text>
          <Text style={styles.value}>{report.score_breakdown.execution}/40</Text>
        </View>
        <View style={{ ...styles.card, flex: 1 }}>
          <Text style={{ ...styles.label, color: '#f87171' }}>Regulatory Penalty</Text>
          <Text style={{ ...styles.value, color: '#f87171' }}>-{report.score_breakdown.regulatory_penalty}/30</Text>
        </View>
      </View>

      {/* REGULATORY WALL */}
      <View style={styles.section}>
        <Text style={styles.label}>Regulatory Audit (DPDP 2023)</Text>
        <View style={styles.card}>
          <Text style={{ fontSize: 10, color: '#e1e1e1' }}>Risk Level: {report.regulatory_audit.dpdp_compliance.risk_level}</Text>
          <View style={{ marginTop: 5 }}>
            {report.regulatory_audit.dpdp_compliance.critical_actions.map((act, i) => (
              <Text key={i} style={{ fontSize: 9, color: '#a1a1aa' }}>• {act}</Text>
            ))}
          </View>
        </View>
      </View>

      {/* HARSH TRUTH */}
      <View style={{ marginTop: 20, padding: 15, backgroundColor: 'rgba(248, 113, 113, 0.05)', border: 1, borderColor: 'rgba(248, 113, 113, 0.2)' }}>
        <Text style={{ ...styles.label, color: '#f87171' }}>Consultant Truth Bomb</Text>
        <Text style={styles.truthBomb}>"{report.harsh_truth.truth_bomb}"</Text>
      </View>

      {/* ROADMAP */}
      <View style={{ marginTop: 40 }}>
        <Text style={styles.label}>90-Day GTM Roadmap</Text>
        <View style={{ marginTop: 10 }}>
          {report.ninety_day_roadmap.map((step, i) => (
            <View key={i} style={styles.roadmapItem}>
              <Text style={{ fontWeight: 'bold', color: '#10b981' }}>Phase 0{i + 1}:</Text>
              <Text>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={{ position: 'absolute', bottom: 30, left: 40, fontSize: 8, color: '#71717a' }}>
        Nexus Decision OS - Confidential Strategic Protocol - India 2026 Spec
      </Text>
    </Page>
  </Document>
);
