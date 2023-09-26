import torch
import torch.nn.functional as F
import random

with open("../names.txt", "r") as f:
    words = f.read().splitlines()

chars = sorted(list(set("".join(words))))
s_to_i = {s: i + 1 for i, s in enumerate(chars)}
s_to_i["."] = 0
i_to_s = {i: s for s, i in s_to_i.items()}

block_size = 3


def build_dataset(words, block_size):
    X, Y = [], []
    for w in words:
        # print(w)
        context = [0] * block_size
        for ch in w + ".":
            ix = s_to_i[ch]
            X.append(context)
            Y.append(ix)
            # print("".join(i_to_s[i] for i in context), "->", i_to_s[ix])
            context = context[1:] + [ix]

    X = torch.tensor(X)
    Y = torch.tensor(Y)
    print(X.shape, Y.shape)
    return X, Y


random.shuffle(words)
n1 = int(0.8 * len(words))
n2 = int(0.9 * len(words))

Xtr, Ytr = build_dataset(words[:n1], block_size)
Xdev, Ydev = build_dataset(words[n1:n2], block_size)
Xtest, Ytest = build_dataset(words[n2:], block_size)

n_embed = 10
n_hidden = 100

g = torch.Generator().manual_seed(500)
C = torch.randn((27, n_embed), generator=g)
# https://pytorch.org/docs/stable/nn.init.html
W1 = torch.randn((n_embed * block_size, n_hidden), generator=g) * (5/3) / ((n_embed * block_size)**0.5)
# W1 = torch.randn((n_embed * block_size, n_hidden), generator=g) * 0.02
# b1 = torch.randn(n_hidden, generator=g) * 0.01 # no need to add bias. It will not do anything since there is bn layer after it
W2 = torch.randn((n_hidden, 27), generator=g) * 0.01
b2 = torch.randn(27, generator=g) * 0

bngain = torch.ones((1, n_hidden))
bnbias = torch.zeros((1, n_hidden))
bnmean_running = torch.zeros((1, n_hidden))
bnstd_running = torch.ones((1, n_hidden))

# parameters = [C, W1, b1, W2, b2, bngain, bnbias]
parameters = [C, W1, W2, b2, bngain, bnbias]

print(f"Number of parameters: {sum(p.nelement() for p in parameters)}")

for p in parameters:
    p.requires_grad = True


# used for polotting
# lri = []
# lossi = []
# stepi = []

lr = 0.1
# n_iters = 5_000
n_iters = 100
# n_iters = 200_000
if n_iters == 10_000:
    print(f"Training for fewer iterations ({n_iters})")

print("\nTraining ...")
for i in range(n_iters):
    # minibach
    ix = torch.randint(0, Xtr.shape[0], (90,))

    # forward
    emb = C[Xtr[ix]]
    # h = torch.tanh(emb.view(-1, n_embed * block_size) @ W1 + b1)
    hpreact = emb.view(-1, n_embed * block_size) @ W1 # + b1

    bnmeani = hpreact.mean(0, keepdim=True)
    bnstdi = hpreact.std(0, keepdim=True)

    # hpreact = bngain * ((hpreact - hpreact.mean(0, keepdim=True)) / hpreact.std(0, keepdim=True)) + bnbias
    hpreact = bngain * ((hpreact - bnmeani) / bnstdi) + bnbias # very small epsilon can be added to bnstdi (1e-5)

    with torch.no_grad():
        bnmean_running = bnmean_running * 0.999 + bnmeani * 0.001
        bnstd_running = bnstd_running * 0.999 + bnstdi * 0.001



    h = torch.tanh(hpreact)


    logits = h @ W2 + b2

    # counts = logits.exp()
    # probs = counts / counts.sum(1, keepdim=True)
    # loss = -probs[torch.arange(32), Y].log().mean()
    loss = F.cross_entropy(logits, Ytr[ix])

    # backward
    for p in parameters:
        p.grad = None
    loss.backward()

    # update
    # lr = lrs[i]
    if i == 60_000:
        lr = 0.06
    for p in parameters:
        p.data -= lr * p.grad  # pyright: ignore[reportGeneralTypeIssues]

    # used for polotting
    # lri.append(lre[i])
    # lossi.append(loss.log10().item())
    # stepi.append(i)
print("...Finished\n")
# print(b1.grad)

# bnmean, bnstd = None, None
# with torch.no_grad():
#     emb = C[Xtr]
#     hpreact = emb.view(emb.shape[0], -1) @ W1 + b1
#     bnmean = hpreact.mean(0, keepdim=True)
#     bnstd = hpreact.std(0, keepdim=True)
# print(bnmean.shape, bnstd.shape)

with torch.no_grad():
    # print(f"{Xdev!r}")
    emb = C[Xdev]
    # print("2222222")
    # print(emb.shape)
    # print((emb.view(-1, n_embed * block_size) @ W1 + b1).shape)
    hpreact = emb.view(-1, n_embed * block_size) @ W1 # + b1
    # print((hpreact - hpreact.mean(0, keepdim=True)).shape)
    # print(((hpreact - hpreact.mean(0, keepdim=True)) / hpreact.std(0, keepdim=True)).shape)
    # print(bngain.shape)
    # print("2222222")
    # hpreact = bngain * ((hpreact - hpreact.mean(0, keepdim=True)) / hpreact.std(0, keepdim=True)) + bnbias
    # hpreact = bngain * ((hpreact - bnmean) / bnstd) + bnbias
    hpreact = bngain * ((hpreact - bnmean_running) / bnstd_running) + bnbias

    h = torch.tanh(hpreact)
    # h = torch.tanh(emb.view(-1, n_embed * block_size) @ W1 + b1)
    logits = h @ W2 + b2
    loss = F.cross_entropy(logits, Ydev)
    print(f"Loss for valid split {loss}")


g = torch.Generator().manual_seed(500)
for _ in range(20):
    out = []
    context = [0] * block_size  # initialize with all ...
    while True:
        emb = C[torch.tensor([context])]  # (1,block_size,d) 1, 3, 10
        hpreact = emb.view(1, -1) @ W1 # + b1
            # print("a----")
            # print(f"{hpreact!r}")
            # print(f"{hpreact.shape}")
            # print("mean----")
        # print(f"{hpreact.mean(0, keepdim=True)}")
            # print(f"{hpreact.mean()}")
            # print("std----")
            # print(f"{hpreact.std()}")
            # print("----")
        # print(f"{hpreact - hpreact.mean(0, keepdim=True)}")
            # print(f"{hpreact - hpreact.mean()}")
            # print("----")
        # hpreact = bngain * ((hpreact - hpreact.mean(0, keepdim=True)) / hpreact.std(0, keepdim=True)) + bnbias
        # hpreact = bngain * hpreact + bnbias

        # print(hpreact.shape)
        # print(bnmean.shape)
        # print("-~~-")
        # print(hpreact - bnmean)
        # print("-~~-")
        # print("-~~-")
        # print("-~~-")

        # hpreact = bngain * ((hpreact - bnmean) / bnstd) + bnbias
        hpreact = bngain * ((hpreact - bnmean_running) / bnstd_running) + bnbias
            # print(f"{hpreact!r}")
            # print("----")
        h = torch.tanh(hpreact)
        # h = torch.tanh(emb.view(1, -1) @ W1 + b1)
        logits = h @ W2 + b2
        # print(f"{logits!r}")
        probs = F.softmax(logits, dim=1)
        # print("----")
        # print(f"{probs!r}")
        ix = torch.multinomial(probs, num_samples=1, generator=g).item()
        context = context[1:] + [ix]
        out.append(ix)
        if ix == 0:
            break

    print("".join(i_to_s[i] for i in out))
