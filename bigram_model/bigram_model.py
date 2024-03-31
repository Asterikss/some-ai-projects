import torch
import matplotlib.pyplot as plt
import torch.nn.functional as F

with open("../names.txt", "r") as f:
    words = f.read().splitlines()

chars = sorted(set("".join(words)))
s_to_i = {s: i + 1 for i, s in enumerate(chars)}
s_to_i["."] = 0

i_to_s = {i: s for s, i in s_to_i.items()}

xs, ys = [], []

for w in words:
    chs = ["."] + list(w) + ["."]
    for ch1, ch2 in zip(chs, chs[1:]):
        x1, x2 = s_to_i[ch1], s_to_i[ch2]
        xs.append(x1)
        ys.append(x2)

xs = torch.tensor(xs)
ys = torch.tensor(ys)
num = xs.nelement()

g = torch.Generator().manual_seed(500)
W = torch.randn((27, 27), generator=g, requires_grad=True)

counts = None

# gradient descent
for k in range(100):
    # forward pass
    xenc = F.one_hot(
        xs, num_classes=27
    ).float()  # input
    logits = xenc @ W  # log-counts
    # softmax
    counts = logits.exp()
    probs = counts / counts.sum(1, keepdims=True)  # probabilities for next character
    # probs[0, 5], probs[1, 13], probs[2, 13], probs[3, 1], probs[4, 0], torch.arange(5)
    loss = -probs[torch.arange(num), ys].log().mean() + 0.01 * (W**2).mean() # regularization of loss / ~smoothing. Must be 0
    print(loss.item())

    # backward pass
    W.grad = None
    loss.backward()

    # update
    # W.data -= 1.0 * W.grad
    W.data -= 50 * W.grad


# sampling
for i in range(5):

    out = []
    ix = 0
    while True:
        xenc = F.one_hot(torch.tensor([ix]), num_classes=27).float()
        logits = xenc @ W # predict log-counts
        counts = logits.exp() # counts, equivalent to N
        p = counts / counts.sum(1, keepdims=True) # probabilities for next character

        ix = torch.multinomial(p, num_samples=1, replacement=True, generator=g).item()
        # out.append(i_to_s[ix])
        out.append(i_to_s[int(ix)])
        if ix == 0:
            break
    print(''.join(out))


# plt.imshow(counts, cmap='viridis', interpolation='nearest')
# plt.colorbar()
# plt.show()
