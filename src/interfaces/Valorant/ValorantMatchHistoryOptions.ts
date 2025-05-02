export default interface ValorantMatchHistoryOptions {
    queue?: 'competitive' | 'unrated' | 'spikerush' | 'deathmatch' | 'escalation' | 'replication';
    startIndex?: number;
    endIndex?: number;
}