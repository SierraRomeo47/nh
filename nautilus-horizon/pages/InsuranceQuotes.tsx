import React, { useState, useEffect } from 'react';
import {
  insuranceService,
  InsuranceQuoteRequest,
  InsuranceQuote,
  VesselType,
  CargoType,
  RouteRiskZone,
  CoverageType,
  SafetyRating,
} from '../services/insuranceService';

const InsuranceQuotes: React.FC = () => {
  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<InsuranceQuote | null>(null);

  // Form state
  const [quoteRequest, setQuoteRequest] = useState<InsuranceQuoteRequest>({
    vesselName: '',
    vesselType: VesselType.CONTAINER,
    vesselAge: 5,
    grossTonnage: 50000,
    cargoValue: 5000000,
    cargoType: CargoType.CONTAINER,
    routeOrigin: '',
    routeDestination: '',
    routeRiskZone: RouteRiskZone.LOW,
    voyageDuration: 30,
    coverageType: [CoverageType.HULL_AND_MACHINERY, CoverageType.PROTECTION_INDEMNITY],
    deductible: 50000,
    previousClaims: 0,
    safetyRating: SafetyRating.GOOD,
    complianceScore: 85,
    requestDate: new Date(),
  });

  const handleGenerateQuote = async () => {
    setLoading(true);
    try {
      const quote = await insuranceService.generateQuote(quoteRequest);
      setQuotes([quote, ...quotes]);
      setSelectedQuote(quote);
      setShowQuoteForm(false);
    } catch (error) {
      console.error('Error generating quote:', error);
      alert('Failed to generate quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    setLoading(true);
    try {
      const result = await insuranceService.acceptQuote(quoteId);
      if (result.success) {
        alert(`${result.message}\nPolicy Number: ${result.policyNumber}`);
        // Update quote status
        setQuotes(quotes.map(q => 
          q.quoteId === quoteId ? { ...q, status: 'ACCEPTED' as const } : q
        ));
      }
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert('Failed to accept quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-orange-400';
      case 'CRITICAL': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Maritime Insurance Quotes
            </h1>
            <p className="text-[var(--text-muted)]">
              Generate and manage insurance quotes for vessels and cargo
            </p>
          </div>
          <button
            onClick={() => setShowQuoteForm(true)}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            + New Quote
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quote List */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] p-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Recent Quotes ({quotes.length})
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {quotes.length === 0 ? (
                  <p className="text-[var(--text-muted)] text-center py-8">
                    No quotes generated yet
                  </p>
                ) : (
                  quotes.map((quote) => (
                    <div
                      key={quote.quoteId}
                      onClick={() => setSelectedQuote(quote)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedQuote?.quoteId === quote.quoteId
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-[var(--border-color)] hover:border-orange-500/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">
                            {quote.vessel.name}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {quote.vessel.type}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          quote.status === 'QUOTED' ? 'bg-blue-500/20 text-blue-400' :
                          quote.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-lg font-bold text-orange-400">
                          {formatCurrency(quote.totalPremium)}
                        </span>
                        <span className={`text-sm font-medium ${getRiskColor(quote.riskAssessment.overallRisk)}`}>
                          {quote.riskAssessment.overallRisk} RISK
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        {quote.quoteId}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quote Detail or Form */}
          <div className="lg:col-span-2">
            {showQuoteForm ? (
              // Quote Form
              <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    Generate New Quote
                  </h2>
                  <button
                    onClick={() => setShowQuoteForm(false)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Vessel Information */}
                  <div>
                    <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                      Vessel Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Vessel Name
                        </label>
                        <input
                          type="text"
                          value={quoteRequest.vesselName}
                          onChange={(e) => setQuoteRequest({...quoteRequest, vesselName: e.target.value})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                          placeholder="Enter vessel name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Vessel Type
                        </label>
                        <select
                          value={quoteRequest.vesselType}
                          onChange={(e) => setQuoteRequest({...quoteRequest, vesselType: e.target.value as VesselType})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                        >
                          {Object.values(VesselType).map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Vessel Age (years)
                        </label>
                        <input
                          type="number"
                          value={quoteRequest.vesselAge}
                          onChange={(e) => setQuoteRequest({...quoteRequest, vesselAge: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Gross Tonnage (GT)
                        </label>
                        <input
                          type="number"
                          value={quoteRequest.grossTonnage}
                          onChange={(e) => setQuoteRequest({...quoteRequest, grossTonnage: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div>
                    <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                      Route & Voyage Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Origin Port
                        </label>
                        <input
                          type="text"
                          value={quoteRequest.routeOrigin}
                          onChange={(e) => setQuoteRequest({...quoteRequest, routeOrigin: e.target.value})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                          placeholder="e.g., Singapore"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Destination Port
                        </label>
                        <input
                          type="text"
                          value={quoteRequest.routeDestination}
                          onChange={(e) => setQuoteRequest({...quoteRequest, routeDestination: e.target.value})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                          placeholder="e.g., Rotterdam"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Route Risk Zone
                        </label>
                        <select
                          value={quoteRequest.routeRiskZone}
                          onChange={(e) => setQuoteRequest({...quoteRequest, routeRiskZone: e.target.value as RouteRiskZone})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                        >
                          {Object.values(RouteRiskZone).map(zone => (
                            <option key={zone} value={zone}>{zone}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Voyage Duration (days)
                        </label>
                        <input
                          type="number"
                          value={quoteRequest.voyageDuration}
                          onChange={(e) => setQuoteRequest({...quoteRequest, voyageDuration: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cargo Information */}
                  <div>
                    <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                      Cargo Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Cargo Type
                        </label>
                        <select
                          value={quoteRequest.cargoType}
                          onChange={(e) => setQuoteRequest({...quoteRequest, cargoType: e.target.value as CargoType})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                        >
                          {Object.values(CargoType).map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Cargo Value (USD)
                        </label>
                        <input
                          type="number"
                          value={quoteRequest.cargoValue}
                          onChange={(e) => setQuoteRequest({...quoteRequest, cargoValue: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div>
                    <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                      Risk Assessment Factors
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Safety Rating
                        </label>
                        <select
                          value={quoteRequest.safetyRating}
                          onChange={(e) => setQuoteRequest({...quoteRequest, safetyRating: e.target.value as SafetyRating})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                        >
                          {Object.values(SafetyRating).map(rating => (
                            <option key={rating} value={rating}>{rating}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Compliance Score (0-100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={quoteRequest.complianceScore}
                          onChange={(e) => setQuoteRequest({...quoteRequest, complianceScore: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Previous Claims (last 5 years)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={quoteRequest.previousClaims}
                          onChange={(e) => setQuoteRequest({...quoteRequest, previousClaims: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Deductible (USD)
                        </label>
                        <input
                          type="number"
                          value={quoteRequest.deductible}
                          onChange={(e) => setQuoteRequest({...quoteRequest, deductible: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coverage Types */}
                  <div>
                    <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                      Coverage Types
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.values(CoverageType).map(type => (
                        <label key={type} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={quoteRequest.coverageType.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setQuoteRequest({
                                  ...quoteRequest,
                                  coverageType: [...quoteRequest.coverageType, type]
                                });
                              } else {
                                setQuoteRequest({
                                  ...quoteRequest,
                                  coverageType: quoteRequest.coverageType.filter(t => t !== type)
                                });
                              }
                            }}
                            className="w-4 h-4 text-orange-500 border-[var(--border-color)] rounded focus:ring-orange-500"
                          />
                          <span className="text-sm text-[var(--text-primary)]">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => setShowQuoteForm(false)}
                      className="px-6 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateQuote}
                      disabled={loading || !quoteRequest.vesselName || !quoteRequest.routeOrigin || !quoteRequest.routeDestination}
                      className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Generating...' : 'Generate Quote'}
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedQuote ? (
              // Quote Detail View
              <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                      {selectedQuote.vessel.name}
                    </h2>
                    <p className="text-[var(--text-muted)]">
                      Quote ID: {selectedQuote.quoteId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-400">
                      {formatCurrency(selectedQuote.totalPremium)}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">Total Premium</p>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="mb-6 p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Risk Assessment</h3>
                    <span className={`text-lg font-bold ${getRiskColor(selectedQuote.riskAssessment.overallRisk)}`}>
                      {selectedQuote.riskAssessment.overallRisk} RISK
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    {selectedQuote.riskAssessment.recommendation}
                  </p>
                  <div className="space-y-3">
                    {selectedQuote.riskAssessment.riskFactors.map((factor, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--text-primary)]">{factor.category}</span>
                          <span className="text-[var(--text-muted)]">{factor.score}/100</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              factor.impact === 'HIGH' ? 'bg-red-500' :
                              factor.impact === 'MEDIUM' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${factor.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coverage Breakdown */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Coverage Breakdown</h3>
                  <div className="space-y-3">
                    {selectedQuote.coverage.map((coverage, index) => (
                      <div key={index} className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">{coverage.type}</p>
                            <p className="text-sm text-[var(--text-muted)] mt-1">{coverage.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-400">{formatCurrency(coverage.premium)}</p>
                            <p className="text-xs text-[var(--text-muted)]">Limit: {formatCurrency(coverage.limit)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Terms & Conditions</h3>
                  <ul className="space-y-2">
                    {selectedQuote.termsAndConditions.map((term, index) => (
                      <li key={index} className="flex items-start text-sm text-[var(--text-muted)]">
                        <span className="text-orange-400 mr-2">•</span>
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                {selectedQuote.status === 'QUOTED' && (
                  <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => handleAcceptQuote(selectedQuote.quoteId)}
                      disabled={loading}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Accept & Issue Policy'}
                    </button>
                  </div>
                )}

                {selectedQuote.status === 'ACCEPTED' && (
                  <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
                    <p className="text-green-400 font-medium">✓ Policy Issued Successfully</p>
                  </div>
                )}
              </div>
            ) : (
              // Empty State
              <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                    No Quote Selected
                  </h3>
                  <p className="text-[var(--text-muted)] mb-6">
                    Generate a new quote or select an existing quote from the list to view details
                  </p>
                  <button
                    onClick={() => setShowQuoteForm(true)}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Generate New Quote
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceQuotes;

