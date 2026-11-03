"""Static package safety checks; run: python -m unittest discover -s tests -v"""
import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
class StarterSafetyTests(unittest.TestCase):
    def test_sample_content_explicitly_unverified(self):
        data = json.loads((ROOT / 'spec/sample_content.json').read_text(encoding='utf-8'))
        self.assertIn('NOT OFFICIAL', data['warning'])
        self.assertEqual(data['review_status'], 'DRAFT')
        self.assertEqual(data['exercise']['answer'], 12 // 3)
        self.assertEqual(data['exercise']['transfer_answer'], 15 // 3)
    def test_openapi_declares_no_live_learner_account_routes(self):
        contents=(ROOT/'spec/api.openapi.yaml').read_text(encoding='utf-8')
        self.assertNotIn('/v1/children/signup', contents)
        self.assertIn('NOT production AI', contents)
    def test_demo_is_honestly_labeled(self):
        html=(ROOT/'app/index.html').read_text(encoding='utf-8')
        self.assertIn('haqiqiy AI emas',html)
        self.assertIn('Shaxsiy ma’lumot kiritmang',html)

if __name__ == '__main__': unittest.main()
