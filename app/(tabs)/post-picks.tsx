import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { picksService } from '../../services/picks';
import { analyticsService } from '../../services/analytics';
import mockOddsData from '../../data/mockOdds.json';

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  moneyline: {
    home: number;
    away: number;
    draw?: number;
  };
  spread: {
    home: number;
    away: number;
    homeOdds: number;
    awayOdds: number;
  };
  total: {
    over: number;
    under: number;
    overOdds: number;
    underOdds: number;
  };
}

interface SelectedBet {
  gameId: string;
  game: Game;
  betType: 'moneyline' | 'spread' | 'total';
  selection: string;
  odds: number;
  line?: number;
}

export default function PostPicksScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'league' | 'odds' | 'form'>('league');
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [games, setGames] = useState<Game[]>([]);
  const [selectedBet, setSelectedBet] = useState<SelectedBet | null>(null);
  const [activeTab, setActiveTab] = useState<'moneyline' | 'spread' | 'total'>('moneyline');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [pickContent, setPickContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [pickPrice, setPickPrice] = useState('');
  const [units, setUnits] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [isFeaturePick, setIsFeaturePick] = useState(false);

  const leagues = [
    { id: 'NFL', name: 'NFL', icon: '🏈' },
    { id: 'NBA', name: 'NBA', icon: '🏀' },
    { id: 'MLB', name: 'MLB', icon: '⚾' },
    { id: 'NHL', name: 'NHL', icon: '🏒' },
    { id: 'Soccer', name: 'Soccer', icon: '⚽' },
  ];

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const selectLeague = (leagueId: string) => {
    setSelectedLeague(leagueId);
    setGames(mockOddsData[leagueId as keyof typeof mockOddsData]?.games || []);
    setCurrentStep('odds');
  };

  const selectBet = (game: Game, betType: 'moneyline' | 'spread' | 'total', selection: string, odds: number, line?: number) => {
    setSelectedBet({
      gameId: game.id,
      game,
      betType,
      selection,
      odds,
      line,
    });
    setCurrentStep('form');
  };

  const formatOdds = (odds: number) => {
    if (odds > 0) return `+${odds}`;
    return odds.toString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const submitPick = async () => {
    if (!user || !selectedBet) {
      Alert.alert('Error', 'Please log in to post picks');
      return;
    }

    if (!pickContent.trim()) {
      Alert.alert('Error', 'Please enter your pick analysis');
      return;
    }

    try {
      setLoading(true);

      const pickData = {
        handicapperId: user.uid,
        content: pickContent.trim(),
        game: `${selectedBet.game.awayTeam} @ ${selectedBet.game.homeTeam}`,
        pick: selectedBet.selection,
        confidence: confidence * 10, // Convert 1-10 to 10-100
        isPaid: pickPrice !== '',
        price: pickPrice ? parseFloat(pickPrice) : undefined,
        isFree: !pickPrice,
        likes: 0,
        comments: 0,
        shares: 0,
        sport: selectedLeague,
        status: 'pending' as const,
        tags: [selectedBet.betType, selectedLeague.toLowerCase()],
        analysis: pickContent.trim(),
        reasoning: `Betting ${selectedBet.betType} on ${selectedBet.selection} at ${formatOdds(selectedBet.odds)} odds`,
        units: units ? parseInt(units) : undefined,
        isFeaturePick,
        isPublic,
        betDetails: {
          gameId: selectedBet.gameId,
          betType: selectedBet.betType,
          selection: selectedBet.selection,
          odds: selectedBet.odds,
          line: selectedBet.line,
        },
      };

          await picksService.createPick(pickData);
          
          // Log analytics event
          analyticsService.logPostPick({
            handicapperId: user.uid,
            sport: selectedLeague,
            isPaid: pickPrice !== '',
            price: pickPrice ? parseFloat(pickPrice) : undefined,
            confidence: confidence * 10,
            pickType: selectedBet.betType,
          });
          
          Alert.alert(
            'Pick Posted!',
            'Your pick has been successfully posted to the feed.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Reset form
                  setCurrentStep('league');
                  setSelectedLeague('');
                  setSelectedBet(null);
                  setPickContent('');
                  setIsPublic(true);
                  setPickPrice('');
                  setUnits('');
                  setConfidence(5);
                  setIsFeaturePick(false);
                },
              },
            ]
          );
    } catch (error) {
      console.error('Error posting pick:', error);
      Alert.alert('Error', 'Failed to post pick. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderLeagueSelection = () => (
    <View className="flex-1 px-6 py-8">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Select League
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 mb-8">
        Choose the league for your pick
      </Text>

      <View className="space-y-4">
        {leagues.map((league) => (
          <TouchableOpacity
            key={league.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 flex-row items-center"
            onPress={() => selectLeague(league.id)}
          >
            <Text className="text-3xl mr-4">{league.icon}</Text>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {league.name}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400">
                {mockOddsData[league.id as keyof typeof mockOddsData]?.games?.length || 0} games available
              </Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOddsBoard = () => (
    <View className="flex-1">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity
          className="mb-4"
          onPress={() => setCurrentStep('league')}
        >
          <Text className="text-blue-600 text-lg">← Back to Leagues</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          {selectedLeague} Games
        </Text>
        <Text className="text-gray-600 dark:text-gray-400">
          Select a bet to create your pick
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row border-b border-gray-200 dark:border-gray-700">
        {(['moneyline', 'spread', 'total'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-4 items-center ${
              activeTab === tab ? 'border-b-2 border-blue-500' : ''
            }`}
            onPress={() => setActiveTab(tab)}
          >
            <Text className={`font-semibold capitalize ${
              activeTab === tab
                ? 'text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Games List */}
      <ScrollView className="flex-1">
        {games.map((game) => (
          <View key={game.id} className="border-b border-gray-200 dark:border-gray-700 p-4">
            {/* Game Header */}
            <View className="mb-4">
              <Text className="text-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                {formatTime(game.gameTime)}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-900 dark:text-white font-semibold flex-1 text-center">
                  {game.awayTeam}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 mx-4">@</Text>
                <Text className="text-gray-900 dark:text-white font-semibold flex-1 text-center">
                  {game.homeTeam}
                </Text>
              </View>
            </View>

            {/* Betting Options */}
            <View className="space-y-2">
              {activeTab === 'moneyline' && (
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    onPress={() => selectBet(game, 'moneyline', game.awayTeam, game.moneyline.away)}
                  >
                    <Text className="text-center text-gray-900 dark:text-white font-semibold">
                      {game.awayTeam}
                    </Text>
                    <Text className="text-center text-blue-600 dark:text-blue-400 font-bold">
                      {formatOdds(game.moneyline.away)}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    onPress={() => selectBet(game, 'moneyline', game.homeTeam, game.moneyline.home)}
                  >
                    <Text className="text-center text-gray-900 dark:text-white font-semibold">
                      {game.homeTeam}
                    </Text>
                    <Text className="text-center text-blue-600 dark:text-blue-400 font-bold">
                      {formatOdds(game.moneyline.home)}
                    </Text>
                  </TouchableOpacity>
                  {game.moneyline.draw && (
                    <TouchableOpacity
                      className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                      onPress={() => selectBet(game, 'moneyline', 'Draw', game.moneyline.draw)}
                    >
                      <Text className="text-center text-gray-900 dark:text-white font-semibold">
                        Draw
                      </Text>
                      <Text className="text-center text-blue-600 dark:text-blue-400 font-bold">
                        {formatOdds(game.moneyline.draw)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {activeTab === 'spread' && (
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    onPress={() => selectBet(game, 'spread', `${game.awayTeam} ${game.spread.away}`, game.spread.awayOdds, game.spread.away)}
                  >
                    <Text className="text-center text-gray-900 dark:text-white font-semibold">
                      {game.awayTeam}
                    </Text>
                    <Text className="text-center text-gray-600 dark:text-gray-400 text-sm">
                      {game.spread.away > 0 ? '+' : ''}{game.spread.away}
                    </Text>
                    <Text className="text-center text-blue-600 dark:text-blue-400 font-bold">
                      {formatOdds(game.spread.awayOdds)}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    onPress={() => selectBet(game, 'spread', `${game.homeTeam} ${game.spread.home}`, game.spread.homeOdds, game.spread.home)}
                  >
                    <Text className="text-center text-gray-900 dark:text-white font-semibold">
                      {game.homeTeam}
                    </Text>
                    <Text className="text-center text-gray-600 dark:text-gray-400 text-sm">
                      {game.spread.home > 0 ? '+' : ''}{game.spread.home}
                    </Text>
                    <Text className="text-center text-blue-600 dark:text-blue-400 font-bold">
                      {formatOdds(game.spread.homeOdds)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeTab === 'total' && (
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    onPress={() => selectBet(game, 'total', `Over ${game.total.over}`, game.total.overOdds, game.total.over)}
                  >
                    <Text className="text-center text-gray-900 dark:text-white font-semibold">
                      Over
                    </Text>
                    <Text className="text-center text-gray-600 dark:text-gray-400 text-sm">
                      {game.total.over}
                    </Text>
                    <Text className="text-center text-blue-600 dark:text-blue-400 font-bold">
                      {formatOdds(game.total.overOdds)}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    onPress={() => selectBet(game, 'total', `Under ${game.total.under}`, game.total.underOdds, game.total.under)}
                  >
                    <Text className="text-center text-gray-900 dark:text-white font-semibold">
                      Under
                    </Text>
                    <Text className="text-center text-gray-600 dark:text-gray-400 text-sm">
                      {game.total.under}
                    </Text>
                    <Text className="text-center text-blue-600 dark:text-blue-400 font-bold">
                      {formatOdds(game.total.underOdds)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderPickForm = () => (
    <ScrollView className="flex-1 px-6 py-8">
      {/* Header */}
      <View className="mb-6">
        <TouchableOpacity
          className="mb-4"
          onPress={() => setCurrentStep('odds')}
        >
          <Text className="text-blue-600 text-lg">← Back to Odds</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create Your Pick
        </Text>
        {selectedBet && (
          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
            <Text className="text-blue-900 dark:text-blue-100 font-semibold">
              Selected Bet: {selectedBet.selection}
            </Text>
            <Text className="text-blue-800 dark:text-blue-200 text-sm">
              {selectedBet.game.awayTeam} @ {selectedBet.game.homeTeam}
            </Text>
            <Text className="text-blue-800 dark:text-blue-200 text-sm">
              {selectedBet.betType.toUpperCase()} • {formatOdds(selectedBet.odds)}
            </Text>
          </View>
        )}
      </View>

      {/* Pick Analysis */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Pick Analysis *
        </Text>
        <TextInput
          className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[120px]"
          placeholder="Explain your reasoning for this pick. Include key factors, trends, and analysis..."
          placeholderTextColor="#9CA3AF"
          value={pickContent}
          onChangeText={setPickContent}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Public Toggle */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Public Pick
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Make this pick visible to all users
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: '#767577', true: '#3B82F6' }}
            thumbColor={isPublic ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Pick Price */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Pick Price (Optional)
        </Text>
        <TextInput
          className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Enter price (e.g., 4.99) or leave empty for free"
          placeholderTextColor="#9CA3AF"
          value={pickPrice}
          onChangeText={setPickPrice}
          keyboardType="numeric"
        />
        <Text className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          Leave empty to make this a free pick
        </Text>
      </View>

      {/* Units */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Units (Optional)
        </Text>
        <TextInput
          className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Enter units (e.g., 2)"
          placeholderTextColor="#9CA3AF"
          value={units}
          onChangeText={setUnits}
          keyboardType="numeric"
        />
      </View>

      {/* Confidence Slider */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Confidence Level: {confidence}/10
        </Text>
        <View className="flex-row space-x-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <TouchableOpacity
              key={level}
              className={`flex-1 h-10 rounded-lg items-center justify-center ${
                level <= confidence
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              onPress={() => setConfidence(level)}
            >
              <Text className={`font-semibold ${
                level <= confidence
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Feature Pick Toggle */}
      <View className="mb-8">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Feature Pick
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Highlight this as a premium pick
            </Text>
          </View>
          <Switch
            value={isFeaturePick}
            onValueChange={setIsFeaturePick}
            trackColor={{ false: '#767577', true: '#3B82F6' }}
            thumbColor={isFeaturePick ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-blue-600 rounded-lg py-4 mb-4"
        onPress={submitPick}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-semibold text-lg">
            Post Pick
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Header with Menu Button */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={openDrawer}>
          <Text className="text-2xl">☰</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900 dark:text-white">
          Post Pick
        </Text>
        <View className="w-6" />
      </View>

      {/* Content */}
      {currentStep === 'league' && renderLeagueSelection()}
      {currentStep === 'odds' && renderOddsBoard()}
      {currentStep === 'form' && renderPickForm()}
    </View>
  );
}
