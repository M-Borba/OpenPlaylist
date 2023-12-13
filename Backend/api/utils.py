import re


def extract_alphanumeric_with_spaces(s):
    return re.sub(r'[^a-zA-Z0-9\s]', '', s)

# JS( "The Real Slim Shady" "Eminem - The Real Slim Shady (Official Video - Clean Version)") = 1
def jaccard_similarity(word1, word2):  # returns a float between 0 and 1
    word1_alphanumeric = extract_alphanumeric_with_spaces(word1.lower())
    word2_alphanumeric = extract_alphanumeric_with_spaces(word2.lower())
    s1 = set(word1_alphanumeric.split())
    s2 = set(word2_alphanumeric.split())
    return float(len(s1.intersection(s2)) / len(min(s1, s2))) # min instead of union