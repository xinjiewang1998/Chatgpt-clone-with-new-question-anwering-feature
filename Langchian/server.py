from langchain.embeddings.openai import OpenAIEmbeddings
import os

os.environ['OPENAI_API_KEY'] = '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'

from langchain.document_loaders import TextLoader
loader = TextLoader('text.txt')

from langchain.indexes import VectorstoreIndexCreator

index = VectorstoreIndexCreator().from_loaders([loader])
OPENAI_API_KEY='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'
query = "What did the president say about Ketanji Brown Jackson"
index.query(query)